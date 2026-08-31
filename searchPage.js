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

        // Display Fitment Warning from compatibilityNotes
        if (itemData.compatibilityNotes) {
            $item('#compatibilityWarning').text = itemData.compatibilityNotes;
            $item('#compatibilityWarning').show();
        } else {
            $item('#compatibilityWarning').hide();
        }

        $item('#container1').onClick(() => {
            wixLocationFrontend.to(itemData.productPageUrl);
        });
    });

    // 2. Populate all dropdowns, then read URL query values
    populateAllDropdowns().then(() => {
        const query = wixLocationFrontend.query;

        $w('#dropdownBrand').value    = query.brand    || "All / Any";
        $w('#dropdownModel').value    = query.browseGuitarType || "All / Any";
        $w('#dropdownPartType').value = query.partType || "All / Any";
        $w('#dropdownPart').value     = query.part     || "All / Any";

        // If a brand was pre-selected from URL, cascade the downstream dropdowns first
        const brand      = $w('#dropdownBrand').value;
        const guitarType = $w('#dropdownModel').value;
        const partType   = $w('#dropdownPartType').value;

        if (brand && brand !== "All / Any" && brand !== "All") {
            // Re-filter all downstream dropdowns based on URL params, then search
            refreshAllDownstream(brand, guitarType, partType).then(() => {
                // Restore the URL selections after cascade refresh
                $w('#dropdownModel').value    = query.browseGuitarType || "All / Any";
                $w('#dropdownPartType').value = query.partType         || "All / Any";
                $w('#dropdownPart').value     = query.part             || "All / Any";
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
        const brand      = $w('#dropdownBrand').value;
        const guitarType = $w('#dropdownModel').value;
        await refreshPartTypeAndParts(brand, guitarType);
        filterProducts();
    });

    // Part Type changes → refresh Parts only, then filter
    $w('#dropdownPartType').onChange(async () => {
        const brand      = $w('#dropdownBrand').value;
        const guitarType = $w('#dropdownModel').value;
        const partType   = $w('#dropdownPartType').value;
        await refreshParts(brand, guitarType, partType);
        filterProducts();
    });

    // Parts change → just filter (no further cascade needed)
    $w('#dropdownPart').onChange(() => filterProducts());
});

// Build a base CMS query filtered by whichever values are set (non-All)
function buildBaseQuery(brand, guitarType, partType) {
    let q = wixData.query("Guitar_Parts_Crazy_Master_CMS_V2");
    if (brand      && brand      !== "All / Any" && brand      !== "All" && brand      !== "") q = q.eq("brand", brand);
    if (guitarType && guitarType !== "All / Any" && guitarType !== "All" && guitarType !== "") q = q.contains("browseGuitarType", guitarType);
    if (partType   && partType   !== "All / Any" && partType   !== "All" && partType   !== "") q = q.eq("partType", partType);
    return q;
}

// Populate all dropdowns with unfiltered data on initial page load
async function populateAllDropdowns() {
    try {
        const [brands, guitarTypes, partTypes, parts] = await Promise.all([
            wixData.query("Guitar_Parts_Crazy_Master_CMS_V2").distinct("brand"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS_V2").distinct("browseGuitarType"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS_V2").distinct("partType"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS_V2").distinct("subcategoryProductType")
        ]);

        $w('#dropdownBrand').options    = buildOptions([...new Set(brands.items.filter(Boolean))].sort());
        $w('#dropdownModel').options    = buildOptions(extractSplitOptions(guitarTypes.items));
        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());
    } catch (error) {
        console.error("Error fetching distinct dropdown values:", error);
    }
}

// Used on page load when URL has pre-selected values: re-filter all downstream without resetting values
async function refreshAllDownstream(brand, guitarType, partType) {
    try {
        const brandQuery = buildBaseQuery(brand, null, null);
        const modelQuery = buildBaseQuery(brand, guitarType, null);

        const [guitarTypes, partTypes, parts] = await Promise.all([
            brandQuery.distinct("browseGuitarType"),
            modelQuery.distinct("partType"),
            buildBaseQuery(brand, guitarType, partType).distinct("subcategoryProductType")
        ]);

        $w('#dropdownModel').options    = buildOptions(extractSplitOptions(guitarTypes.items));
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
        const [guitarTypes, partTypes, parts] = await Promise.all([
            baseQuery.distinct("browseGuitarType"),
            baseQuery.distinct("partType"),
            baseQuery.distinct("subcategoryProductType")
        ]);

        $w('#dropdownModel').options    = buildOptions(extractSplitOptions(guitarTypes.items));
        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());

        // Reset downstream selections
        $w('#dropdownModel').value    = "All / Any";
        $w('#dropdownPartType').value = "All / Any";
        $w('#dropdownPart').value     = "All / Any";
    } catch (error) {
        console.error("Error refreshing dropdowns after brand change:", error);
    }
}

// Guitar Model changes → refresh Part Type and Parts
async function refreshPartTypeAndParts(brand, guitarType) {
    try {
        const baseQuery = buildBaseQuery(brand, guitarType, null);
        const [partTypes, parts] = await Promise.all([
            baseQuery.distinct("partType"),
            baseQuery.distinct("subcategoryProductType")
        ]);

        $w('#dropdownPartType').options = buildOptions([...new Set(partTypes.items.filter(Boolean))].sort());
        $w('#dropdownPart').options     = buildOptions([...new Set(parts.items.filter(Boolean))].sort());

        // Reset downstream selections
        $w('#dropdownPartType').value = "All / Any";
        $w('#dropdownPart').value     = "All / Any";
    } catch (error) {
        console.error("Error refreshing dropdowns after model change:", error);
    }
}

// Part Type changes → refresh Parts only
async function refreshParts(brand, guitarType, partType) {
    try {
        const baseQuery = buildBaseQuery(brand, guitarType, partType);
        const parts = await baseQuery.distinct("subcategoryProductType");

        $w('#dropdownPart').options = buildOptions([...new Set(parts.items.filter(Boolean))].sort());
        $w('#dropdownPart').value   = "All / Any";
    } catch (error) {
        console.error("Error refreshing parts after part type change:", error);
    }
}

function extractSplitOptions(items) {
    const allTokens = [];
    for (const item of items) {
        if (!item) continue;
        const tokens = item.toString().split('|').map(t => t.trim()).filter(Boolean);
        allTokens.push(...tokens);
    }
    return [...new Set(allTokens)].sort();
}

function buildOptions(values) {
    const options = values.map(value => ({ label: value, value: value }));
    options.unshift({ label: "All / Any", value: "All / Any" });
    return options;
}

// Filter products from Wix Stores using CMS SKUs
async function filterProducts() {
    const brand      = $w('#dropdownBrand').value;
    const guitarType = $w('#dropdownModel').value;
    const partType   = $w('#dropdownPartType').value;
    const part       = $w('#dropdownPart').value;

    console.log("Filtering with:", { brand, guitarType, partType, part });

    let cmsQuery = wixData.query("Guitar_Parts_Crazy_Master_CMS_V2");

    if (brand      && brand      !== "All / Any" && brand      !== "All" && brand      !== "") cmsQuery = cmsQuery.eq("brand", brand);
    if (guitarType && guitarType !== "All / Any" && guitarType !== "All" && guitarType !== "") cmsQuery = cmsQuery.contains("browseGuitarType", guitarType);
    if (partType   && partType   !== "All / Any" && partType   !== "All" && partType   !== "") cmsQuery = cmsQuery.eq("partType", partType);
    if (part       && part       !== "All / Any" && part       !== "All" && part       !== "") cmsQuery = cmsQuery.eq("subcategoryProductType", part);

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
