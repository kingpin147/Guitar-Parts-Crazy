import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
    // 1. Map data to the repeater elements
    $w('#repeater1').onItemReady(($item, itemData) => {
        $item('#productName').text = itemData.name;
        $item('#price').text = itemData.formattedPrice || ("$" + itemData.price.toString());

        if (itemData.mainMedia) {
            $item('#productImage').src = itemData.mainMedia;
        }

        $item('#container1').onClick(() => {
            wixLocationFrontend.to(itemData.productPageUrl);
        });
    });

    // Populate dropdowns and then read search values
    populateDropdowns().then(() => {
        // 2. Read search values from the URL query
        const query = wixLocationFrontend.query;

        $w('#dropdownBrand').value = query.brand || "All";
        $w('#dropdownModel').value = query.model || "All";
        $w('#dropdownPartType').value = query.partType || "All";
        $w('#dropdownPart').value = query.part || "All";
       
        // 3. Search and load products based on the dropdown/query values
        filterProducts();
    });

    // 6. Automatically update search when any dropdown selection changes
    $w('#dropdownBrand').onChange(() => filterProducts());
    $w('#dropdownModel').onChange(() => filterProducts());
    $w('#dropdownPartType').onChange(() => filterProducts());
    $w('#dropdownPart').onChange(() => filterProducts());
});

async function populateDropdowns() {
    try {
        const [brands, models, partTypes, parts] = await Promise.all([
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("brand"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("guitarModel"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("partType"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("subcategoryProductType")
        ]);

        // .distinct() for tags fields (like guitarModel) might return flattened unique tags, or we might need to handle them.
        // Assuming .distinct() handles arrays gracefully in Wix or returns exactly what we need.
        const flatBrands = [...new Set(brands.items.filter(Boolean))].sort();
        const flatModels = [...new Set(models.items.flat().filter(Boolean))].sort(); // Use .flat() just in case it returns array of arrays
        const flatPartTypes = [...new Set(partTypes.items.filter(Boolean))].sort();
        const flatParts = [...new Set(parts.items.filter(Boolean))].sort();

        $w('#dropdownBrand').options = buildOptions(flatBrands);
        $w('#dropdownModel').options = buildOptions(flatModels);
        $w('#dropdownPartType').options = buildOptions(flatPartTypes);
        $w('#dropdownPart').options = buildOptions(flatParts);
    } catch (error) {
        console.error("Error fetching distinct dropdown values:", error);
    }
}

function buildOptions(values) {
    const options = values.map(value => ({ label: value, value: value }));
    options.unshift({ label: "All", value: "All" }); // Provide an "All" option with a real value so it doesn't show placeholder
    return options;
}

// Function to filter products directly from Wix Stores using CMS SKUs
async function filterProducts() {
    const brand = $w('#dropdownBrand').value;
    const model = $w('#dropdownModel').value;
    const partType = $w('#dropdownPartType').value;
    const part = $w('#dropdownPart').value;

    console.log("Filtering with:", { brand, model, partType, part });

    let cmsQuery = wixData.query("Guitar_Parts_Crazy_Master_CMS");

    if (brand && brand !== "All" && brand !== "") {
        cmsQuery = cmsQuery.eq("brand", brand);
    }
    if (model && model !== "All" && model !== "") {
        cmsQuery = cmsQuery.hasSome("guitarModel", [model]);
    }
    if (partType && partType !== "All" && partType !== "") {
        cmsQuery = cmsQuery.eq("partType", partType);
    }
    if (part && part !== "All" && part !== "") {
        cmsQuery = cmsQuery.eq("subcategoryProductType", part);
    }

    try {
        const cmsResults = await cmsQuery.limit(1000).find();
        console.log(`CMS Query found ${cmsResults.items.length} items`);
        
        const skus = [...new Set(cmsResults.items.map(item => item.sku).filter(Boolean))];
        console.log(`Extracted ${skus.length} unique SKUs`, skus);
        
        if (skus.length === 0) {
            showNoProducts();
            return;
        }

        // Fetch products by SKU in chunks of 50 (Wix Data limit for hasSome)
        let allProducts = [];
        const skuChunks = [];
        for (let i = 0; i < skus.length; i += 50) {
            skuChunks.push(skus.slice(i, i + 50));
        }

        for (const chunk of skuChunks) {
            const productResults = await wixData.query("Stores/Products")
                .hasSome("sku", chunk)
                .find();
            allProducts = allProducts.concat(productResults.items);
        }

        console.log(`Fetched ${allProducts.length} matching products from Wix Stores`);

        if (allProducts.length > 0) {
            $w('#repeater1').data = allProducts;
            $w('#repeater1').show();
            hideNoProducts();
        } else {
            showNoProducts();
        }
    } catch (error) {
        console.error("Error filtering products:", error);
        showNoProducts();
    }
}

function showNoProducts() {
    $w('#repeater1').data = [];
    $w('#repeater1').hide();
    $w('#noProductsText').show();
}

function hideNoProducts() {
    $w('#noProductsText').hide();
}
