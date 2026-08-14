# Wix Studio CMS Architecture

This document outlines the simplified Wix CMS architecture to support advanced navigation and the "Product Finder" while keeping **Wix Stores** as the single source of truth.

## Core Strategy: The Single Collection Approach
To keep maintenance as simple as possible, we will use **exactly ONE custom CMS collection** (e.g., `ProductMetadata`). 

This collection will extend your existing Wix Stores products. It will contain a single Reference field pointing to the native `Stores/Products` collection, and all other classifications (Brand, Part Type, etc.) will be stored as simple Text or Tag fields directly in this one database. There are no other custom databases to manage.

## Proposed CMS Structure: `ProductMetadata`

| Field Name | Field Type | Example Values | Purpose |
| :--- | :--- | :--- | :--- |
| **Product** | Reference (Single) | `Stores/Products` | The core link to the actual Wix product. *(Mandatory, matched via Product Name on import)* |
| **SKU** | Text | `GTH-GE1996T-C` | Permanent identifier key for cross-referencing and ongoing maintenance. |
| **Wix Product ID** | Text | `a1b2c3d4-5678...` | Optional system ID reference. |
| **Brand** | Text | Gotoh, Wilkinson | Enables "Shop by Brand" and filtering. |
| **Part Type** | Text | Bridges, Necks | Enables "Shop by Part". |
| **Guitar Type** | Tags | Strat, Tele, Les Paul | Tags allow multiple values (e.g. if a part fits a Strat *and* a Tele). |
| **Guitar Model** | Tags | Standard Stratocaster | Specific model compatibility. |
| **Compatibility** | Text | "Fits standard USA models" | General text for compatibility notes. |
| **Finish/Colour** | Tags | Chrome, Black, Gold | Tags allow multiple finishes if grouped. |
| **Bridge Type** | Text | Tremolo, Hardtail | Technical spec filter. |
| **String Spacing** | Text | 54mm, 52.5mm | Technical spec filter. |
| **Mounting Style** | Text | 2-Point, 6-Screw | Technical spec filter. |
| **Tuner Layout** | Text | 6-in-line, 3+3 | Technical spec filter. |
| **Nut Size** | Text | 42mm, 43mm | Technical spec filter. |
| **Block Size** | Text | 40mm | Technical spec filter. |

> [!TIP]
> **Why Tags vs Text?** 
> We recommend **Text** fields for things where a product only ever has *one* value (e.g., a product is only one Brand, or one Part Type). We recommend **Tags** (Multiple Selection) for fields where a single product might fit *multiple* categories (e.g., a tuning peg fits both Strat and Tele).

## How to Prepare Your Import File (CSV)
To link your new CMS data to your existing Wix Stores products, your import file needs a way to "match" the records. 

When you import data into a Wix Reference field, Wix uses the **Primary Field** of the target collection. For Wix Stores, the Primary Field is the **Product Name**.

**Step-by-Step Data Prep:**
1. **Export** your current products from Wix Stores to a CSV file. This gives you the exact spelling of all your Product Names and SKUs.
2. **Create a new spreadsheet** for your CMS import.
3. Make Column 1 **Product Name** (used by Wix on initial import to establish the Reference link).
4. Make Column 2 **SKU** (stored in `ProductMetadata` as a permanent, static anchor key).
5. Add your new columns for the custom filters: **Brand**, **Part Type**, **Guitar Type**, etc.
6. Fill in the data for each product. 
7. When you import this CSV into your new `ProductMetadata` collection, Wix will read the "Product Name" column and automatically connect it to the actual product in Wix Stores!

> [!NOTE]
> **Product Title Changes & Reference Link Integrity:**
> - **Initial Import:** Wix matches the CSV record using the Product Name.
> - **Post-Import Link:** Once Wix creates the link, it stores the internal permanent system ID (`_id`).
> - **Title Changes:** Changing a Product Name in Wix Stores after import **will NOT break the CMS link**. The link remains intact and automatically displays the updated product details.
> - **SKU Column Advantage:** Keeping `SKU` as a text field in `ProductMetadata` ensures you always have a fixed business key for cross-referencing (e.g. `VLOOKUP` in Excel) if you ever perform future bulk CSV updates.

*Note: You do NOT need to match or use native Wix Store Categories. The Product Finder will completely ignore native categories and rely 100% on your new custom columns.*

## How the Product Finder Will Work (Velo Logic)
Even with just one collection, the product finder works perfectly:
1. **User Input:** User selects `Strat` -> `Bridges` -> `Gotoh`.
2. **Query:** Velo queries this single `ProductMetadata` collection where:
   - `Guitar Type` (Tags) includes `Strat`
   - `Part Type` (Text) is `Bridges`
   - `Brand` (Text) is `Gotoh`
3. **Display:** Velo retrieves the matching row, extracts the `Product` reference, and populates a Repeater with the actual Wix Store product (showing native Price, Image, and Add to Cart).

## Ongoing Maintenance Workflow
When you add a new product:
1. **Wix Stores:** Add the product normally (Title, Price, Inventory, SKU).
2. **Wix CMS (`ProductMetadata`):** Open this *single* database, add a new row, select your Wix Store product from the dropdown, input its SKU, and select your filter text and tags. No duplication of price, title, or stock, and no extra databases to manage!