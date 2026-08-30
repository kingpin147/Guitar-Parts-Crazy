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

    // 2. Populate all dropdowns, then read URL query values
    populateAllDropdowns().then(() => {
        const query = wixLocationFrontend.query;

        $w('#dropdownBrand').value    = query.brand    || "All";
        $w('#dropdownModel').value    = query.model    || "All";
        $w('#dropdownPartType').value = query.partType || "All";
        $w('#dropdownPart').value     = query.part     || "All";

        // If a brand was pre-selected from URL, cascade the downstream dropdowns first
        const brand    = $w('#dropdownBrand').value;
        const model    = $w('#dropdownModel').value;
        const partType = $w('#dropdownPartType').value;

        if (brand && brand !== "All") {
            // Re-filter all downstream dropdowns based on URL params, then search
            refreshAllDownstream(brand, model, partType).then(() => {
                // Restore the URL selections after cascade refresh
                $w('#dropdownModel').value    = query.model    || "All";
                $w('#dropdownPartType').value = query.partType || "All";
                $w('#dropdownPart').value     = query.part     || "All";
                filterProducts();
            });
        } else {
            filterProducts();
        }
    });

    // --- Cascading Dropdown Logic ---

    // Brand changes → refresh Guitar Model, Part Type, and Parts, then filter
    $w('#dropdownBrand').onChange(async () => {
        const brand = $w('#dropdownBrand').value;
        await refreshDownstream(brand);
        filterProducts();
    });

    // Guitar Model changes → refresh Part Type and Parts, then filter
    $w('#dropdownModel').onChange(async () => {
        const brand = $w('#dropdownBrand').value;
        const model = $w('#dropdownModel').value;
        await refreshPartTypeAndParts(brand, model);
        filterProducts();
    });

    // Part Type changes → refresh Parts only, then filter
    $w('#dropdownPartType').onChange(async () => {
        const brand    = $w('#dropdownBrand').value;
        const model    = $w('#dropdownModel').value;
        const partType = $w('#dropdownPartType').value;
        await refreshParts(brand, model, partType);
        filterProducts();
    });

    // Parts change → just filter (no further cascade needed)
    $w('#dropdownPart').onChange(() => filterProducts());
});

// Build a base CMS query filtered by whichever values are set (non-All)
function buildBaseQuery(brand, model, partType) {
    let q = wixData.query("Guitar_Parts_Crazy_Master_CMS");
    if (brand    && brand    !== "All" && brand    !== "") q = q.eq("brand", brand);
    if (model    && model    !== "All" && model    !== "") q = q.hasSome("guitarModel", [model]);
    if (partType && partType !== "All" && partType !== "") q = q.eq("partType", partType);
    return q;
}

// Populate all dropdowns with unfiltered data on initial page load
async function populateAllDropdowns() {
    try {
        const [brands, models, partTypes, parts] = await Promise.all([
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("brand"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("guitarModel"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("partType"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("subcategoryProductType")
        ]);

        $w('#dropdownBrand').options    = buildOptions([...new Set(brands.items.filter(Boolean))].sort());
        $w('#dropdownModel').options    = buildOptions([...new Set(models.items.flat().filter(Boolean))].sort());
        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());
    } catch (error) {
        console.error("Error fetching distinct dropdown values:", error);
    }
}

// Used on page load when URL has pre-selected values: re-filter all downstream without resetting values
async function refreshAllDownstream(brand, model, partType) {
    try {
        const brandQuery = buildBaseQuery(brand, null, null);
        const modelQuery = buildBaseQuery(brand, model, null);

        const [models, partTypes, parts] = await Promise.all([
            brandQuery.distinct("guitarModel"),
            modelQuery.distinct("partType"),
            buildBaseQuery(brand, model, partType).distinct("subcategoryProductType")
        ]);

        $w('#dropdownModel').options    = buildOptions([...new Set(models.items.flat().filter(Boolean))].sort());
        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());
    } catch (error) {
        console.error("Error refreshing dropdowns from URL params:", error);
    }
}

// Brand changes → refresh Guitar Model, Part Type, and Parts
async function refreshDownstream(brand) {
    try {
        const baseQuery = buildBaseQuery(brand, null, null);
        const [models, partTypes, parts] = await Promise.all([
            baseQuery.distinct("guitarModel"),
            baseQuery.distinct("partType"),
            baseQuery.distinct("subcategoryProductType")
        ]);

        $w('#dropdownModel').options    = buildOptions([...new Set(models.items.flat().filter(Boolean))].sort());
        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());

        // Reset downstream selections
        $w('#dropdownModel').value    = "All";
        $w('#dropdownPartType').value = "All";
        $w('#dropdownPart').value     = "All";
    } catch (error) {
        console.error("Error refreshing dropdowns after brand change:", error);
    }
}

// Guitar Model changes → refresh Part Type and Parts
async function refreshPartTypeAndParts(brand, model) {
    try {
        const baseQuery = buildBaseQuery(brand, model, null);
        const [partTypes, parts] = await Promise.all([
            baseQuery.distinct("partType"),
            baseQuery.distinct("subcategoryProductType")
        ]);

        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());

        // Reset downstream selections
        $w('#dropdownPartType').value = "All";
        $w('#dropdownPart').value     = "All";
    } catch (error) {
        console.error("Error refreshing dropdowns after model change:", error);
    }
}

// Part Type changes → refresh Parts only
async function refreshParts(brand, model, partType) {
    try {
        const baseQuery = buildBaseQuery(brand, model, partType);
        const parts = await baseQuery.distinct("subcategoryProductType");

        $w('#dropdownPart').options = buildOptions([...new Set(parts.items.filter(Boolean))].sort());
        $w('#dropdownPart').value   = "All";
    } catch (error) {
        console.error("Error refreshing parts after part type change:", error);
    }
}

function buildOptions(values) {
    const options = values.map(value => ({ label: value, value: value }));
    options.unshift({ label: "All", value: "All" });
    return options;
}

// Filter products from Wix Stores using CMS SKUs
async function filterProducts() {
    const brand    = $w('#dropdownBrand').value;
    const model    = $w('#dropdownModel').value;
    const partType = $w('#dropdownPartType').value;
    const part     = $w('#dropdownPart').value;

    console.log("Filtering with:", { brand, model, partType, part });

    let cmsQuery = wixData.query("Guitar_Parts_Crazy_Master_CMS");

    if (brand    && brand    !== "All" && brand    !== "") cmsQuery = cmsQuery.eq("brand", brand);
    if (model    && model    !== "All" && model    !== "") cmsQuery = cmsQuery.hasSome("guitarModel", [model]);
    if (partType && partType !== "All" && partType !== "") cmsQuery = cmsQuery.eq("partType", partType);
    if (part     && part     !== "All" && part     !== "") cmsQuery = cmsQuery.eq("subcategoryProductType", part);

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
