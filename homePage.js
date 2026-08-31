import wixLocationFrontend from 'wix-location-frontend';
import wixData from 'wix-data';

$w.onReady(function () {
    // Populate all dropdowns with full data on page load
    populateAllDropdowns();

    // --- Cascading Dropdown Logic ---

    // Brand changes → refresh Guitar Model, Part Type, and Parts
    $w('#dropdownBrand').onChange(async () => {
        const brand = $w('#dropdownBrand').value;
        await refreshDownstream(brand, null, null);
    });

    // Guitar Model changes → refresh Part Type and Parts
    $w('#dropdownModel').onChange(async () => {
        const brand = $w('#dropdownBrand').value;
        const model = $w('#dropdownModel').value;
        await refreshPartTypeAndParts(brand, model, null);
    });

    // Part Type changes → refresh Parts only
    $w('#dropdownPartType').onChange(async () => {
        const brand = $w('#dropdownBrand').value;
        const model = $w('#dropdownModel').value;
        const partType = $w('#dropdownPartType').value;
        await refreshParts(brand, model, partType);
    });

    // When user clicks the "Find Parts" search button
    $w('#findPartsBtn').onClick(() => {
        $w('#findPartsBtn').disable();
        $w('#findPartsBtn').label = "Searching...";
        // Small delay so the browser paints the disabled/label state before navigating
        setTimeout(() => {
            handleSearch();
        }, 150);
    });
});

// Build a base CMS query filtered by whichever values are set (non-All)
function buildBaseQuery(brand, guitarType, partType) {
    let q = wixData.query("Guitar_Parts_Crazy_Master_CMS_V2");
    if (brand && brand !== "All" && brand !== "") q = q.eq("brand", brand);
    if (guitarType && guitarType !== "All" && guitarType !== "") q = q.contains("browseGuitarType", guitarType);
    if (partType && partType !== "All" && partType !== "") q = q.eq("partType", partType);
    return q;
}

// Populate all dropdowns with unfiltered data on initial load
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
        console.error("Error fetching dropdown values:", error);
    }
}

// Called when Brand changes: refresh Guitar Model, Part Type, and Parts
async function refreshDownstream(brand, guitarType, partType) {
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

// Called when Guitar Model changes: refresh Part Type and Parts
async function refreshPartTypeAndParts(brand, guitarType, partType) {
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

// Called when Part Type changes: refresh Parts only
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

function handleSearch() {
    const brand      = $w('#dropdownBrand').value;
    const guitarType = $w('#dropdownModel').value;
    const partType   = $w('#dropdownPartType').value;
    const part       = $w('#dropdownPart').value;

    const params = [];
    if (brand      && brand      !== "All / Any" && brand      !== "All" && brand      !== "") params.push(`brand=${encodeURIComponent(brand)}`);
    if (guitarType && guitarType !== "All / Any" && guitarType !== "All" && guitarType !== "") params.push(`browseGuitarType=${encodeURIComponent(guitarType)}`);
    if (partType   && partType   !== "All / Any" && partType   !== "All" && partType   !== "") params.push(`partType=${encodeURIComponent(partType)}`);
    if (part       && part       !== "All / Any" && part       !== "All" && part       !== "") params.push(`part=${encodeURIComponent(part)}`);

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';

    // Redirect to the Search Parts page with the selected values in the URL
    wixLocationFrontend.to(`/searchparts${queryString}`);
}
