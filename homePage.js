import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
    // When user clicks the "Find Parts" search button
    $w('#findPartsBtn').onClick(() => {
        handleSearch();
    });

    // Optional: Also search if user presses Enter in the search input
    $w('#searchInput').onKeyPress((event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});

function handleSearch() {
    const brand = $w('#dropdownBrand').value;
    const model = $w('#dropdownModel').value;
    const partType = $w('#dropdownPartType').value;
    const part = $w('#dropdownPart').value;
    const search = $w('#searchInput').value;

    const params = [];
    if (brand) params.push(`brand=${encodeURIComponent(brand)}`);
    if (model) params.push(`model=${encodeURIComponent(model)}`);
    if (partType) params.push(`partType=${encodeURIComponent(partType)}`);
    if (part) params.push(`part=${encodeURIComponent(part)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';

    // Redirect to the Search Parts page with the selected values in the URL
    wixLocationFrontend.to(`/searchparts${queryString}`);
}
