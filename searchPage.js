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

    // 2. Read search values from the URL query
    const query = wixLocationFrontend.query;

    if (query.brand) {
        $w('#dropdownBrand').value = query.brand;
    }
    if (query.model) {
        $w('#dropdownModel').value = query.model;
    }
    if (query.partType) {
        $w('#dropdownPartType').value = query.partType;
    }
    if (query.part) {
        $w('#dropdownPart').value = query.part;
    }
    if (query.search) {
        $w('#searchInput').value = query.search;
    }

    // 3. Search and load products based on the dropdown/query values
    filterProducts();

    // 4. Click "Find Parts" button on the search page to filter
    $w('#findPartsBtn').onClick(() => {
        filterProducts();
    });

    // 5. Automatically update search when any dropdown selection changes
    $w('#dropdownBrand').onChange(() => filterProducts());
    $w('#dropdownModel').onChange(() => filterProducts());
    $w('#dropdownPartType').onChange(() => filterProducts());
    $w('#dropdownPart').onChange(() => filterProducts());
});

// Function to filter products directly from Wix Stores
function filterProducts() {
    const brand = $w('#dropdownBrand').value;
    const model = $w('#dropdownModel').value;
    const partType = $w('#dropdownPartType').value;
    const part = $w('#dropdownPart').value;
    const search = $w('#searchInput').value;

    let query = wixData.query("Stores/Products");

    if (search && search.trim() !== "") {
        query = query.contains("name", search.trim());
    }
    if (brand && brand.trim() !== "") {
        query = query.contains("name", brand.trim());
    }
    if (model && model.trim() !== "") {
        query = query.contains("name", model.trim());
    }
    if (partType && partType.trim() !== "") {
        query = query.contains("name", partType.trim());
    }
    if (part && part.trim() !== "") {
        query = query.contains("name", part.trim());
    }

    query.limit(20)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#repeater1').data = results.items;
                $w('#repeater1').show();
            } else {
                $w('#repeater1').data = [];
                $w('#repeater1').hide();
                console.log("No matching products found.");
            }
        })
        .catch((error) => console.error("Error filtering products:", error));
}
