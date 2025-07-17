import { test, expect } from '@playwright/test'

test.describe('Hover Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to characters page where most hover effects are used
    await page.goto('/characters')
    await page.waitForLoadState('networkidle')
  })

  test('Card3D hover should be subtle and natural', async ({ page }) => {
    const card3D = page.locator('[class*="card-3d"]').first()
    
    if (await card3D.count() > 0) {
      // Get initial transform
      const initialTransform = await card3D.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.transform
      })

      // Hover over the card
      await card3D.hover()
      await page.waitForTimeout(100)

      // Check if transform changed but is not too extreme
      const hoverTransform = await card3D.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.transform
      })

      expect(hoverTransform).not.toBe(initialTransform)
      
      // Check that rotation values are reasonable (should be less than 10 degrees)
      const rotationMatch = hoverTransform.match(/rotateX\(([^)]+)\)|rotateY\(([^)]+)\)/g)
      if (rotationMatch) {
        rotationMatch.forEach(rotation => {
          const degreeMatch = rotation.match(/(-?\d+(?:\.\d+)?)deg/)
          if (degreeMatch) {
            const degrees = Math.abs(parseFloat(degreeMatch[1]))
            expect(degrees).toBeLessThan(10) // Should be less than 10 degrees for natural feel
          }
        })
      }
    }
  })

  test('CharacterCard hover should be gentle', async ({ page }) => {
    const characterCard = page.locator('.character-card').first()
    
    if (await characterCard.count() > 0) {
      // Get initial position
      const initialBox = await characterCard.boundingBox()
      
      // Hover over the card
      await characterCard.hover()
      await page.waitForTimeout(100)
      
      // Get position after hover
      const hoverBox = await characterCard.boundingBox()
      
      if (initialBox && hoverBox) {
        // Check that the card moved up slightly (but not too much)
        const verticalMovement = initialBox.y - hoverBox.y
        expect(verticalMovement).toBeGreaterThan(0) // Should move up
        expect(verticalMovement).toBeLessThan(5) // But not more than 5px
      }
      
      // Check shadow is applied but not too intense
      const boxShadow = await characterCard.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.boxShadow
      })
      
      expect(boxShadow).not.toBe('none')
      // Shadow should be subtle (opacity should be low)
      expect(boxShadow).toMatch(/rgba?\([^)]+,\s*0\.[0-2]/) // Opacity should be 0.2 or less
    }
  })

  test('DirectionAwareHover should have smooth transitions', async ({ page }) => {
    const directionAware = page.locator('[class*="direction-aware-hover"]').first()
    
    if (await directionAware.count() > 0) {
      // Test hover from different directions
      const box = await directionAware.boundingBox()
      if (box) {
        // Hover from top
        await page.mouse.move(box.x + box.width / 2, box.y + 5)
        await page.waitForTimeout(100)
        
        // Hover from left
        await page.mouse.move(box.x + 5, box.y + box.height / 2)
        await page.waitForTimeout(100)
        
        // Check that transitions are smooth (duration should be reasonable)
        const hoverContent = page.locator('.content-hover').first()
        if (await hoverContent.count() > 0) {
          const transitionDuration = await hoverContent.evaluate(el => {
            const style = window.getComputedStyle(el)
            return style.transitionDuration
          })
          
          // Should have transition duration (not instant)
          expect(transitionDuration).not.toBe('0s')
          // But not too slow
          expect(parseFloat(transitionDuration)).toBeLessThan(1) // Less than 1 second
        }
      }
    }
  })

  test('Hover effects should respect reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const card3D = page.locator('[class*="card-3d"]').first()
    
    if (await card3D.count() > 0) {
      // Get initial transform
      const initialTransform = await card3D.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.transform
      })

      // Hover over the card
      await card3D.hover()
      await page.waitForTimeout(100)

      // With reduced motion, transform should not change significantly
      const hoverTransform = await card3D.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.transform
      })

      // Check that transition is disabled or minimal
      const transitionDuration = await card3D.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.transitionDuration
      })
      
      expect(transitionDuration).toBe('0s') // Should be instant with reduced motion
    }
  })

  test('Image hover zoom should be subtle', async ({ page }) => {
    const imageHover = page.locator('[class*="image-hover-zoom"]').first()
    
    if (await imageHover.count() > 0) {
      const image = imageHover.locator('img').first()
      
      if (await image.count() > 0) {
        // Get initial scale
        const initialTransform = await image.evaluate(el => {
          const style = window.getComputedStyle(el)
          return style.transform
        })

        // Hover over the image
        await imageHover.hover()
        await page.waitForTimeout(100)

        // Check scale change
        const hoverTransform = await image.evaluate(el => {
          const style = window.getComputedStyle(el)
          return style.transform
        })

        expect(hoverTransform).not.toBe(initialTransform)
        
        // Check that scale is reasonable (should be around 1.02)
        const scaleMatch = hoverTransform.match(/scale\(([^)]+)\)/)
        if (scaleMatch) {
          const scale = parseFloat(scaleMatch[1])
          expect(scale).toBeGreaterThan(1) // Should scale up
          expect(scale).toBeLessThan(1.05) // But not too much
        }
      }
    }
  })

  test('Focus cards hover should not cause layout shift', async ({ page }) => {
    const focusCard = page.locator('.focus-card').first()
    
    if (await focusCard.count() > 0) {
      // Get initial layout
      const initialBox = await focusCard.boundingBox()
      
      // Hover over the card
      await focusCard.hover()
      await page.waitForTimeout(200)
      
      // Check that layout didn't shift significantly
      const hoverBox = await focusCard.boundingBox()
      
      if (initialBox && hoverBox) {
        // Position should be relatively stable
        const xDiff = Math.abs(initialBox.x - hoverBox.x)
        const yDiff = Math.abs(initialBox.y - hoverBox.y)
        
        expect(xDiff).toBeLessThan(10) // Less than 10px movement
        expect(yDiff).toBeLessThan(10) // Less than 10px movement
      }
    }
  })
})
