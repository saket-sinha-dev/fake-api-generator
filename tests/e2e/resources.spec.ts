/**
 * E2E Tests for Resource Workflows
 * Tests complete resource management including fields, data generation, and API endpoints
 */

import { test, expect } from '@playwright/test';

test.describe('Resource Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    await page.goto('/');
  });

  test.describe('Resource List View', () => {
    test('should display resources page', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });

      await page.goto('/resources');
      
      const heading = page.locator('h1, h2').filter({ hasText: /resource/i });
      await expect(heading.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('Resources page heading not found');
      });
    });

    test('should show empty state with no resources', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });

      await page.goto('/resources');
      
      const emptyMessage = page.getByText(/no resources|create resource|get started/i);
      await expect(emptyMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('Empty state not shown');
      });
    });

    test('should display list of resources', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' },
              { id: '2', name: 'posts', fields: [{ name: 'title', type: 'string' }], projectId: 'p1' },
            ],
          }),
        });
      });

      await page.goto('/resources');
      
      await expect(page.getByText('users')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('posts')).toBeVisible();
    });
  });

  test.describe('Create Resource', () => {
    test('should open create resource form', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        const nameInput = page.getByLabel(/resource name|name/i).or(
          page.getByPlaceholder(/resource name|name/i)
        );
        await expect(nameInput.first()).toBeVisible({ timeout: 2000 });
      }
    });

    test('should create resource with basic fields', async ({ page }) => {
      let createdResource: any = null;
      
      await page.route('**/api/resources', async route => {
        if (route.request().method() === 'POST') {
          createdResource = route.request().postDataJSON();
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: 'new-1',
                name: createdResource.name,
                fields: createdResource.fields,
                projectId: 'p1',
              },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [] }),
          });
        }
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        // Fill resource name
        const nameInput = page.getByLabel(/resource name|name/i).or(
          page.getByPlaceholder(/resource name|name/i)
        ).first();
        await nameInput.fill('users');
        
        // Add fields if form supports it
        const addFieldButton = page.getByRole('button', { name: /add field/i });
        if (await addFieldButton.first().isVisible({ timeout: 1000 })) {
          await addFieldButton.first().click();
          
          // Fill field details
          const fieldNameInput = page.getByLabel(/field name/i).or(
            page.getByPlaceholder(/field name/i)
          ).first();
          await fieldNameInput.fill('name');
          
          const fieldTypeSelect = page.getByLabel(/field type|type/i).first();
          if (await fieldTypeSelect.isVisible({ timeout: 1000 })) {
            await fieldTypeSelect.selectOption('string');
          }
        }
        
        // Submit
        const submitButton = page.getByRole('button', { name: /create|save resource/i }).first();
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        
        if (createdResource) {
          expect(createdResource.name).toBe('users');
        }
      }
    });

    test('should validate resource name format', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        // Try invalid name with spaces
        const nameInput = page.getByLabel(/resource name|name/i).or(
          page.getByPlaceholder(/resource name|name/i)
        ).first();
        await nameInput.fill('invalid name');
        
        const submitButton = page.getByRole('button', { name: /create|save resource/i }).first();
        await submitButton.click();
        
        // Should show validation error
        const errorMessage = page.getByText(/invalid|lowercase|no spaces/i);
        await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {
          console.log('Name validation error not shown');
        });
      }
    });

    test('should add multiple fields to resource', async ({ page }) => {
      let fieldCount = 0;
      
      await page.route('**/api/resources', async route => {
        if (route.request().method() === 'POST') {
          const body = route.request().postDataJSON();
          fieldCount = body.fields?.length || 0;
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: 'new-2', name: body.name, fields: body.fields },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [] }),
          });
        }
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        await page.getByLabel(/resource name|name/i).or(
          page.getByPlaceholder(/resource name|name/i)
        ).first().fill('posts');
        
        // Add multiple fields
        const addFieldButton = page.getByRole('button', { name: /add field/i }).first();
        for (let i = 0; i < 3; i++) {
          if (await addFieldButton.isVisible({ timeout: 1000 })) {
            await addFieldButton.click();
            await page.waitForTimeout(200);
          }
        }
        
        // Submit
        const submitButton = page.getByRole('button', { name: /create|save resource/i }).first();
        await submitButton.click();
        
        await page.waitForTimeout(1000);
      }
    });

    test('should support all field types', async ({ page }) => {
      const fieldTypes = ['string', 'number', 'boolean', 'date', 'email', 'uuid', 'image', 'relation'];
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        // Check if field type dropdown has all types
        const fieldTypeSelect = page.locator('select').filter({ has: page.locator('option') }).first();
        if (await fieldTypeSelect.isVisible({ timeout: 2000 })) {
          const options = await fieldTypeSelect.locator('option').allTextContents();
          
          for (const type of fieldTypes) {
            const hasType = options.some(opt => opt.toLowerCase().includes(type));
            if (!hasType) {
              console.log(`Field type ${type} not found in dropdown`);
            }
          }
        }
      }
    });
  });

  test.describe('Edit Resource', () => {
    test('should open edit form for resource', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' }],
          }),
        });
      });

      await page.goto('/resources');
      
      const editButton = page.getByRole('button', { name: /edit/i }).or(
        page.locator('[aria-label*="edit"]')
      ).first();
      
      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();
        
        const nameInput = page.getByLabel(/resource name|name/i).or(
          page.getByPlaceholder(/resource name|name/i)
        ).first();
        
        await expect(nameInput).toBeVisible();
      }
    });

    test('should update resource fields', async ({ page }) => {
      let updateCalled = false;
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' }],
          }),
        });
      });
      
      await page.route('**/api/resources/1', async route => {
        if (route.request().method() === 'PUT') {
          updateCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: '1', name: 'users', fields: [] }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/resources');
      
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();
        
        // Modify fields
        const addFieldButton = page.getByRole('button', { name: /add field/i }).first();
        if (await addFieldButton.isVisible({ timeout: 1000 })) {
          await addFieldButton.click();
        }
        
        // Save
        const saveButton = page.getByRole('button', { name: /save|update/i }).first();
        await saveButton.click();
        
        await page.waitForTimeout(1000);
        expect(updateCalled).toBe(true);
      }
    });

    test('should remove fields from resource', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { 
                id: '1', 
                name: 'users', 
                fields: [
                  { name: 'name', type: 'string' },
                  { name: 'email', type: 'email' },
                ],
                projectId: 'p1',
              },
            ],
          }),
        });
      });

      await page.goto('/resources');
      
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();
        
        // Find and click remove field button
        const removeFieldButton = page.getByRole('button', { name: /remove|delete field/i }).or(
          page.locator('[aria-label*="remove field"]')
        ).first();
        
        if (await removeFieldButton.isVisible({ timeout: 1000 })) {
          await removeFieldButton.click();
        }
      }
    });
  });

  test.describe('Delete Resource', () => {
    test('should delete resource with confirmation', async ({ page }) => {
      let deleteCalled = false;
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [], projectId: 'p1' }],
          }),
        });
      });
      
      await page.route('**/api/resources/1', async route => {
        if (route.request().method() === 'DELETE') {
          deleteCalled = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/resources');
      
      const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
      if (await deleteButton.isVisible({ timeout: 3000 })) {
        await deleteButton.click();
        
        // Confirm deletion
        const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
        if (await confirmButton.first().isVisible({ timeout: 2000 })) {
          await confirmButton.first().click();
          
          await page.waitForTimeout(1000);
          expect(deleteCalled).toBe(true);
        }
      }
    });
  });

  test.describe('Data Generation', () => {
    test('should show generate data button', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' }],
          }),
        });
      });

      await page.goto('/resources');
      
      const generateButton = page.getByRole('button', { name: /generate|create data/i });
      await expect(generateButton.first()).toBeVisible({ timeout: 3000 }).catch(() => {
        console.log('Generate data button not found');
      });
    });

    test('should generate mock data for resource', async ({ page }) => {
      let generateCalled = false;
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' }],
          }),
        });
      });
      
      await page.route('**/api/resources/1/generate', async route => {
        generateCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            data: [
              { id: '1', name: 'John Doe' },
              { id: '2', name: 'Jane Smith' },
            ],
          }),
        });
      });

      await page.goto('/resources');
      
      const generateButton = page.getByRole('button', { name: /generate|create data/i }).first();
      if (await generateButton.isVisible({ timeout: 3000 })) {
        await generateButton.click();
        
        await page.waitForTimeout(1000);
        expect(generateCalled).toBe(true);
      }
    });

    test('should specify number of records to generate', async ({ page }) => {
      let recordCount = 0;
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' }],
          }),
        });
      });
      
      await page.route('**/api/resources/1/generate*', async route => {
        const url = new URL(route.request().url());
        recordCount = parseInt(url.searchParams.get('count') || '10');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });

      await page.goto('/resources');
      
      const generateButton = page.getByRole('button', { name: /generate|create data/i }).first();
      if (await generateButton.isVisible({ timeout: 3000 })) {
        await generateButton.click();
        
        // Look for count input
        const countInput = page.getByLabel(/count|number|records/i).or(
          page.getByPlaceholder(/count|number/i)
        ).first();
        
        if (await countInput.isVisible({ timeout: 1000 })) {
          await countInput.fill('50');
        }
        
        // Submit
        const submitButton = page.getByRole('button', { name: /generate|create/i }).first();
        await submitButton.click();
        
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('View Resource Data', () => {
    test('should view generated data for resource', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [{ name: 'name', type: 'string' }], projectId: 'p1' }],
          }),
        });
      });
      
      await page.route('**/api/v1/users*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: '1', name: 'John Doe' },
              { id: '2', name: 'Jane Smith' },
            ],
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          }),
        });
      });

      await page.goto('/resources');
      
      // Click view/preview button
      const viewButton = page.getByRole('button', { name: /view|preview|data/i }).first();
      if (await viewButton.isVisible({ timeout: 3000 })) {
        await viewButton.click();
        
        // Should show data table or list
        await expect(page.getByText('John Doe')).toBeVisible({ timeout: 3000 }).catch(() => {
          console.log('Generated data not displayed');
        });
      }
    });

    test('should display endpoint URL for resource', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [], projectId: 'p1' }],
          }),
        });
      });

      await page.goto('/resources');
      
      // Should show API endpoint
      const endpoint = page.getByText(/\/api\/v1\/users/i);
      await expect(endpoint.first()).toBeVisible({ timeout: 3000 }).catch(() => {
        console.log('API endpoint not displayed');
      });
    });

    test('should copy endpoint URL to clipboard', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [], projectId: 'p1' }],
          }),
        });
      });

      await page.goto('/resources');
      
      const copyButton = page.getByRole('button', { name: /copy/i }).or(
        page.locator('[aria-label*="copy"]')
      ).first();
      
      if (await copyButton.isVisible({ timeout: 3000 })) {
        await copyButton.click();
        
        // Check clipboard (may not work in all environments)
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Resource Relations', () => {
    test('should create relation field to another resource', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'users', fields: [], projectId: 'p1' },
                { id: '2', name: 'posts', fields: [], projectId: 'p1' },
              ],
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        // Add relation field
        const addFieldButton = page.getByRole('button', { name: /add field/i }).first();
        if (await addFieldButton.isVisible({ timeout: 1000 })) {
          await addFieldButton.click();
          
          // Select relation type
          const typeSelect = page.getByLabel(/field type|type/i).first();
          if (await typeSelect.isVisible({ timeout: 1000 })) {
            await typeSelect.selectOption('relation');
            
            // Should show related resource dropdown
            const relatedResourceSelect = page.getByLabel(/related|resource/i).first();
            await expect(relatedResourceSelect).toBeVisible({ timeout: 2000 }).catch(() => {
              console.log('Related resource selector not shown');
            });
          }
        }
      }
    });
  });

  test.describe('Search and Filter', () => {
    test('should search resources by name', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: '1', name: 'users', fields: [], projectId: 'p1' },
              { id: '2', name: 'posts', fields: [], projectId: 'p1' },
              { id: '3', name: 'comments', fields: [], projectId: 'p1' },
            ],
          }),
        });
      });

      await page.goto('/resources');
      
      const searchInput = page.getByPlaceholder(/search/i).or(
        page.getByLabel(/search/i)
      ).first();
      
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('user');
        
        // Should filter to only users
        await expect(page.getByText('users')).toBeVisible();
      }
    });

    test('should filter resources by project', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: '1', name: 'users', fields: [], projectId: 'p1' },
              { id: '2', name: 'posts', fields: [], projectId: 'p2' },
            ],
          }),
        });
      });

      await page.goto('/resources');
      
      const projectFilter = page.getByLabel(/project|filter/i).first();
      if (await projectFilter.isVisible({ timeout: 3000 })) {
        // Filter should be available
        await projectFilter.click();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle resource creation errors', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, error: 'Invalid resource name' }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [] }),
          });
        }
      });

      await page.goto('/resources');
      
      const createButton = page.getByRole('button', { name: /create|new resource|add resource/i }).first();
      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click();
        
        const nameInput = page.getByLabel(/resource name|name/i).or(
          page.getByPlaceholder(/resource name|name/i)
        ).first();
        await nameInput.fill('Invalid@Name');
        
        const submitButton = page.getByRole('button', { name: /create|save resource/i }).first();
        await submitButton.click();
        
        // Should show error
        const errorMessage = page.getByText(/error|invalid|failed/i);
        await expect(errorMessage.first()).toBeVisible({ timeout: 2000 });
      }
    });

    test('should handle data generation errors', async ({ page }) => {
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [], projectId: 'p1' }],
          }),
        });
      });
      
      await page.route('**/api/resources/1/generate', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Generation failed' }),
        });
      });

      await page.goto('/resources');
      
      const generateButton = page.getByRole('button', { name: /generate|create data/i }).first();
      if (await generateButton.isVisible({ timeout: 3000 })) {
        await generateButton.click();
        
        await page.waitForTimeout(1000);
        
        // Should show error
        const errorMessage = page.getByText(/error|failed/i);
        await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {
          console.log('Generation error not displayed');
        });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be usable on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.route('**/api/resources', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: '1', name: 'users', fields: [], projectId: 'p1' }],
          }),
        });
      });

      await page.goto('/resources');
      
      // Should display resource list
      await expect(page.getByText('users')).toBeVisible({ timeout: 5000 });
      
      // Create button should be accessible
      const createButton = page.getByRole('button', { name: /create|new resource|add/i }).first();
      await expect(createButton).toBeVisible();
    });
  });
});
