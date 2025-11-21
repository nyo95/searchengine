#!/usr/bin/env node
// Phase 1 Backend Smoke Test Script (Fixed Version)
// Runs Brand + Product + Search tests and writes a markdown log file.
// Requirements: Node.js 18+ (for global fetch)

const fs = require("fs");
const path = require("path");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const logFile = path.join(process.cwd(), "smoke-test-phase1-log-fixed.md");

function resetLog() {
  const header = [
    `# Backend Phase 1 Smoke Test Log (Fixed Script)`,
    ``,
    `Base URL: ${baseUrl}`,
    `Date: ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
  ].join("\n");
  fs.writeFileSync(logFile, header, "utf8");
  console.log(`Writing log to ${logFile}`);
}

function log(line = "") {
  fs.appendFileSync(logFile, line + "\n", "utf8");
  console.log(line);
}

async function request(stepName, method, pathUrl, body) {
  const url = `${baseUrl}${pathUrl}`;
  log(`\n## ${stepName}`);
  log(`**Request:** \`${method} ${pathUrl}\``);

  const options = {
    method,
    headers: {},
  };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
    log(`**Body:**`);
    log("```json");
    log(JSON.stringify(body, null, 2));
    log("```");
  }

  let res;
  let text;
  try {
    res = await fetch(url, options);
    text = await res.text();
  } catch (err) {
    log(`**Error sending request:** ${err.message}`);
    return { ok: false, status: 0, data: null };
  }

  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // not JSON, keep raw text
  }

  log(`**Status:** ${res.status}`);
  log(`**Raw Response:**`);
  log("```json");
  log(text);
  log("```");

  return { ok: res.ok, status: res.status, data };
}

function includesProductId(results, productId) {
  if (!results) return false;
  const items = results.items || results.products || results;
  if (!Array.isArray(items)) return false;
  return !!items.find(
    (p) => p.id === productId || p.productId === productId
  );
}

async function main() {
  resetLog();
  log("Starting Phase 1 smoke tests (Brand + Product + Search)...");

  let brandId = null;
  let productId = null;
  let subcategoryId = null;

  // 1. Create Brand
  const brandPayload = {
    name: "Test Brand X",
    website: "https://example.com",
    phone: "08123456789",
    salesName: "Budi",
    salesContact: "budi@example.com",
  };

  const createBrandRes = await request(
    "1. Create Brand",
    "POST",
    "/api/brands",
    brandPayload
  );

  if (createBrandRes.ok && createBrandRes.data) {
    const b = createBrandRes.data.brand || createBrandRes.data;
    brandId = b.id || b.brandId || null;
    log(`**Result:** ✅ Brand created with id = \`${brandId}\``);
  } else {
    log("**Result:** ❌ Failed to create brand. Subsequent tests may fail.");
  }

  // 2. Get Active Brands
  const getBrandsRes = await request(
    "2. Get Active Brands",
    "GET",
    "/api/brands"
  );
  if (getBrandsRes.ok && getBrandsRes.data) {
    log("**Result:** ✅ Brands list returned.");
  } else {
    log("**Result:** ❌ Failed to get brands list.");
  }

  // 3. Soft Delete Brand (only the brand we just created)
  if (brandId) {
    const softDeleteRes = await request(
      "3. Soft Delete Brand",
      "PATCH",
      `/api/brands/${brandId}`,
      { isActive: false }
    );
    if (softDeleteRes.ok) {
      log("**Result:** ✅ Soft delete request accepted.");
    } else {
      log("**Result:** ❌ Soft delete request failed.");
    }

    // 4. Confirm that THIS brand disappears from active list (ignore other brands)
    const getBrandsAfterDelete = await request(
      "4. Get Active Brands After Soft Delete",
      "GET",
      "/api/brands"
    );
    if (getBrandsAfterDelete.ok && getBrandsAfterDelete.data) {
      const brands = getBrandsAfterDelete.data.brands || [];
      const stillExists = brands.some((b) => b.id === brandId);
      if (!stillExists) {
        log(
          `**Result:** ✅ Brand with id = \`${brandId}\` is no longer in the active list.`
        );
      } else {
        log(
          `**Result:** ❌ Brand with id = \`${brandId}\` still appears in the active list.`
        );
      }
    } else {
      log(
        "**Result:** ❌ Failed to fetch brands after soft delete for verification."
      );
    }

    // 5. Revive Brand
    const reviveRes = await request(
      "5. Revive Brand",
      "PATCH",
      `/api/brands/${brandId}`,
      { isActive: true }
    );
    if (reviveRes.ok) {
      log("**Result:** ✅ Brand revive request accepted.");
    } else {
      log("**Result:** ❌ Brand revive request failed.");
    }

    // 6. Confirm this brand appears again
    const getBrandsAfterRevive = await request(
      "6. Get Active Brands After Revive",
      "GET",
      "/api/brands"
    );
    if (getBrandsAfterRevive.ok && getBrandsAfterRevive.data) {
      const brands = getBrandsAfterRevive.data.brands || [];
      const exists = brands.some((b) => b.id === brandId);
      if (exists) {
        log(
          `**Result:** ✅ Brand with id = \`${brandId}\` appears again in active list.`
        );
      } else {
        log(
          `**Result:** ❌ Brand with id = \`${brandId}\` does NOT appear in active list after revive.`
        );
      }
    } else {
      log(
        "**Result:** ❌ Failed to fetch brands after revive for verification."
      );
    }
  } else {
    log(
      "**Skip:** Cannot test soft delete / revive because brandId is missing."
    );
  }

  // 7. Create Product
  if (!brandId) {
    log(
      "\n**Warning:** brandId is missing. Product creation test may fail because it depends on brandId."
    );
  }
  const productPayload = {
    name: "Homogeneous Tile White 60x60",
    sku: "HT-6060-WH-X",
    brandId: brandId || "MISSING_BRAND_ID",
    categoryName: "Material",
    subcategoryName: "Homogeneous Tile",
    dynamicAttributes: {
      size: "600x600",
      finish: "matt",
      roughness: "R10",
    },
  };

  const createProductRes = await request(
    "7. Create Product",
    "POST",
    "/api/products",
    productPayload
  );
  if (createProductRes.ok && createProductRes.data) {
    const p = createProductRes.data.product || createProductRes.data;
    productId = p.id || p.productId || null;
    subcategoryId =
      p.subcategoryId ||
      (p.subcategory && (p.subcategory.id || p.subcategory.subcategoryId)) ||
      null;
    log(
      `**Result:** ✅ Product created with id = \`${productId}\`, subcategoryId = \`${subcategoryId}\`.`
    );
  } else {
    log(
      "**Result:** ❌ Failed to create product. Subsequent product/search tests may fail."
    );
  }

  // 8. Get Product Detail
  if (productId) {
    const getProductRes = await request(
      "8. Get Product Detail",
      "GET",
      `/api/products/${productId}`
    );
    if (getProductRes.ok) {
      log("**Result:** ✅ Product detail retrieved.");
    } else {
      log("**Result:** ❌ Failed to get product detail.");
    }
  } else {
    log("**Skip:** Cannot get product detail because productId is missing.");
  }

  // 9. Update Product (PATCH)
  if (productId) {
    const updatePayload = {
      name: "Homogeneous Tile White 60x60 (Updated)",
      dynamicAttributes: {
        size: "600x600",
        finish: "glossy",
        roughness: "R10",
      },
    };
    const updateProductRes = await request(
      "9. Update Product (PATCH)",
      "PATCH",
      `/api/products/${productId}`,
      updatePayload
    );
    if (updateProductRes.ok) {
      log("**Result:** ✅ Product update request accepted.");
    } else {
      log("**Result:** ❌ Product update request failed.");
    }
  } else {
    log("**Skip:** Cannot update product because productId is missing.");
  }

  // 10. Search Products (while product still active)
  const searchRes = await request(
    "10. Search Products (q=tile)",
    "GET",
    "/api/search/products?q=tile"
  );
  if (searchRes.ok && searchRes.data) {
    if (productId && includesProductId(searchRes.data, productId)) {
      log(
        `**Result:** ✅ Created product (id=${productId}) appears in search results.`
      );
    } else {
      log(
        "**Result:** ⚠ Search succeeded, but created product was not clearly found in the results."
      );
    }
  } else {
    log("**Result:** ❌ Search request failed.");
  }

  // 11. Deactivate Product
  if (productId) {
    const deactivateRes = await request(
      "11. Deactivate Product",
      "PATCH",
      `/api/products/${productId}`,
      { isActive: false }
    );
    if (deactivateRes.ok) {
      log("**Result:** ✅ Product deactivation request accepted.");
    } else {
      log("**Result:** ❌ Product deactivation request failed.");
    }
  } else {
    log("**Skip:** Cannot deactivate product because productId is missing.");
  }

  // 12. Search Products again, expect deactivated product to be hidden
  const searchAfterDeactivate = await request(
    "12. Search Products After Deactivation (q=tile)",
    "GET",
    "/api/search/products?q=tile"
  );
  if (searchAfterDeactivate.ok && searchAfterDeactivate.data) {
    if (productId && !includesProductId(searchAfterDeactivate.data, productId)) {
      log(
        `**Result:** ✅ Deactivated product (id=${productId}) no longer appears in search results.`
      );
    } else {
      log(
        "**Result:** ⚠ Deactivated product still appears in search results, or could not be checked properly."
      );
    }
  } else {
    log(
      "**Result:** ❌ Search after deactivation failed or did not return usable data."
    );
  }

  // 13. Search by Brand (if brandId exists)
  if (brandId) {
    const searchByBrandRes = await request(
      "13. Search Products by Brand",
      "GET",
      `/api/search/products?q=tile&brandId=${encodeURIComponent(brandId)}`
    );
    if (searchByBrandRes.ok) {
      log("**Result:** ✅ Search by brand request succeeded.");
    } else {
      log("**Result:** ❌ Search by brand request failed.");
    }
  } else {
    log("**Skip:** Cannot test search by brand because brandId is missing.");
  }

  // 14. Search by Subcategory (if subcategoryId exists)
  if (subcategoryId) {
    const searchBySubcatRes = await request(
      "14. Search Products by Subcategory",
      "GET",
      `/api/search/products?q=tile&subcategoryId=${encodeURIComponent(
        subcategoryId
      )}`
    );
    if (searchBySubcatRes.ok) {
      log("**Result:** ✅ Search by subcategory request succeeded.");
    } else {
      log("**Result:** ❌ Search by subcategory request failed.");
    }
  } else {
    log(
      "**Skip:** Cannot test search by subcategory because subcategoryId is missing."
    );
  }

  // 15. Suggestions
  const suggestionsRes = await request(
    "15. Search Suggestions (q=tile)",
    "GET",
    "/api/search/suggestions?q=tile"
  );
  if (suggestionsRes.ok) {
    log("**Result:** ✅ Suggestions request succeeded.");
  } else {
    log("**Result:** ❌ Suggestions request failed.");
  }

  log("\n---");
  log(
    "Phase 1 smoke tests (fixed script) completed. Check the results above for PASS/FAIL details."
  );
}

main().catch((err) => {
  log(`\n**FATAL ERROR:** ${err.stack || err.message}`);
  process.exit(1);
});
