import wixData from 'wix-data';

// This code belongs in backend/data.js within your Wix Studio Editor

export async function Guitar_Parts_Crazy_Master_CMS_V2_beforeInsert(item, context) {
    return await linkWixProduct(item);
}

export async function Guitar_Parts_Crazy_Master_CMS_V2_beforeUpdate(item, context) {
    return await linkWixProduct(item);
}

async function linkWixProduct(item) {
    // If the CMS row has an SKU but doesn't have a linked wixProductId yet
    if (item.sku && !item.wixProductId) {
        try {
            // 1. Query the live Wix Store for the matching SKU
            // suppressAuth allows this backend function to query products globally
            const productQuery = await wixData.query("Stores/Products")
                .eq("sku", item.sku)
                .find({ suppressAuth: true });

            // 2. If exactly one match is found, link the internal Wix Store _id
            if (productQuery.items.length === 1) {
                // Safely establish the link without overwriting the CMS _id
                item.wixProductId = productQuery.items[0]._id;
                console.log(`Successfully linked SKU ${item.sku} to Wix Product ID ${item.wixProductId}`);
            } else if (productQuery.items.length === 0) {
                console.warn(`Link Warning: SKU ${item.sku} not found in live Wix Stores. Skipping link.`);
            } else {
                console.warn(`Link Warning: Multiple products found for SKU ${item.sku}. Skipping link to prevent ambiguity.`);
            }
        } catch (error) {
            console.error(`Error querying Stores/Products for SKU ${item.sku}:`, error);
        }
    }
    
    // Return the modified item to be saved in the CMS
    return item;
}
