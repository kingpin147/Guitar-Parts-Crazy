# Wix Studio CMS Architecture

This document outlines the simplified Wix CMS architecture to support advanced navigation and the "Product Finder" while keeping **Wix Stores** as the single source of truth.

## Core Strategy: The Single Collection Approach
To keep maintenance as simple as possible, we will use **exactly ONE custom CMS collection** (e.g., `ProductMetadata`). 

This collection will extend your existing Wix Stores products. It will contain a single Reference field pointing to the native `Stores/Products` collection, and all other classifications (Brand, Part Type, etc.) will be stored as simple Text or Tag fields directly in this one database. There are no other custom databases to manage.

## Proposed CMS Structure: `ProductMetadata`

| Field Name | Field Type | Example Values | Purpose |
| :--- | :--- | :--- | :--- |
| **Product** | Reference (Single) | `Stores/Products` | The core link to the actual Wix product. *(Mandatory)* |
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
1. **Export** your current products from Wix Stores to a CSV file. This gives you the exact spelling of all your Product Names.
2. **Create a new spreadsheet** for your CMS import.
3. Make the first column **Product Name**. Copy/paste the names exactly as they appear in your Wix Stores export.
4. Add your new columns for the custom filters: **Brand**, **Part Type**, **Guitar Type**, etc.
5. Fill in the data for each product. 
6. When you import this CSV into your new `ProductMetadata` collection, Wix will read the "Product Name" column and automatically connect it to the actual product in Wix Stores!

*Note: You do NOT need to match or use the native Wix Store Categories. The Product Finder will completely ignore native categories and rely 100% on your new custom columns.*

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
1. **Wix Stores:** Add the product normally.
2. **Wix CMS (`ProductMetadata`):** Open this *single* database, add a new row, select your Wix Store product from the dropdown, and type/select your text and tags. No duplication of price, title, or SKU, and no other databases to manage!
That is a great question. You actually do not need to use the native Wix Store categories at all for this!

I have just updated the implementation plan with a new section called "How to Prepare Your Import File (CSV)" to explain exactly how you link the two together.

Here is the quick breakdown of how it works:

When you import data into a Wix CMS Reference field, Wix needs to know which product you are referring to. It does this by looking at the Product Name (which is the primary field for Wix Stores).

So, to prepare your data:

You will export your existing products from Wix Stores to a CSV file. This gives you a spreadsheet with the exact spelling of all your current Product Names.
In your new spreadsheet for the CMS import, make the very first column Product Name and paste those names in.
Then, simply add your custom columns: Brand, Part Type, Guitar Type, etc.
When you upload this CSV to your new ProductMetadata CMS collection, Wix will see the "Product Name" column, find the matching name in Wix Stores, and automatically link them together!
Because they are linked by the Product Name, the custom Product Finder code will completely ignore the native Wix Store categories. It will filter strictly based on your new CMS columns (Guitar Type, Part Type, Brand), and then simply display the attached Wix product.

Please check out the updated plan, and let me know if that process makes sense for preparing your data!