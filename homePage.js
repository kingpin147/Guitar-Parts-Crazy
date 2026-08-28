import wixLocationFrontend from 'wix-location-frontend';
import wixData from 'wix-data';

$w.onReady(function () {
    // Populate the dropdowns when the page loads
    populateDropdowns();

    // When user clicks the "Find Parts" search button
    $w('#findPartsBtn').onClick(() => {
        $w('#findPartsBtn').disable();
        $w('#findPartsBtn').label = "Searching...";
        handleSearch();
    });
});

async function populateDropdowns() {
    try {
        const [brands, models, partTypes, parts] = await Promise.all([
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("brand"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("guitarModel"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("partType"),
            wixData.query("Guitar_Parts_Crazy_Master_CMS").distinct("subcategoryProductType")
        ]);

        const flatBrands = [...new Set(brands.items.filter(Boolean))].sort();
        const flatModels = [...new Set(models.items.flat().filter(Boolean))].sort(); 
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

function handleSearch() {
    const brand = $w('#dropdownBrand').value;
    const model = $w('#dropdownModel').value;
    const partType = $w('#dropdownPartType').value;
    const part = $w('#dropdownPart').value;

    const params = [];
    if (brand && brand !== "All" && brand !== "") params.push(`brand=${encodeURIComponent(brand)}`);
    if (model && model !== "All" && model !== "") params.push(`model=${encodeURIComponent(model)}`);
    if (partType && partType !== "All" && partType !== "") params.push(`partType=${encodeURIComponent(partType)}`);
    if (part && part !== "All" && part !== "") params.push(`part=${encodeURIComponent(part)}`);

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';

    // Redirect to the Search Parts page with the selected values in the URL
    wixLocationFrontend.to(`/searchparts${queryString}`);
}
