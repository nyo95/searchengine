
// run-smoketest-phase2-projects.js
// Smoke test for Backend Phase 2: Project + Schedule APIs

const fs = require('fs');

const BASE_URL = process.env.SMOKETEST_BASE_URL || 'http://localhost:3000';

function log(...args) {
  console.log(...args);
}

async function request(method, path, options = {}) {
  const url = BASE_URL + path;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const body = options.body ? JSON.stringify(options.body) : undefined;

  let res;
  let text;
  try {
    res = await fetch(url, { method, headers, body });
    text = await res.text();
  } catch (err) {
    return {
      ok: false,
      status: 0,
      raw: String(err),
      json: null,
    };
  }

  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse error, keep raw text
  }

  return {
    ok: res.ok,
    status: res.status,
    raw: text,
    json,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function startLog() {
  const lines = [];
  lines.push(`# Backend Phase 2 Smoke Test Log (Projects + Schedule)`);
  lines.push('');
  lines.push(`Base URL: ${BASE_URL}`);
  lines.push(`Date: ${nowIso()}`);
  lines.push('');
  lines.push('---');
  lines.push('Starting Phase 2 smoke tests (Projects + Schedule)...');
  lines.push('');
  return lines;
}

function pushSection(lines, idx, title, req, res, resultLine, extraSkip = []) {
  lines.push(`## ${idx}. ${title}`);
  lines.push(`**Request:** \`${req.method} ${req.path}\``);
  if (req.body) {
    lines.push('**Body:**');
    lines.push('```json');
    lines.push(JSON.stringify(req.body, null, 2));
    lines.push('```');
  }
  lines.push(`**Status:** ${res.status}`);
  lines.push('**Raw Response:**');
  lines.push('```json');
  lines.push(res.raw || '');
  lines.push('```');
  lines.push(`**Result:** ${resultLine}`);
  extraSkip.forEach((s) => lines.push(`**Skip:** ${s}`));
  lines.push('');
}

async function main() {
  const lines = startLog();

  let brandId = null;
  let productId = null;
  let projectId = null;
  let itemAId = null;
  let itemBId = null;
  let itemACode = null;
  let itemBCode = null;

  // 0. Setup: create brand + product dependency
  // ------------------------------------------

  // 0.1 Create brand for Phase 2
  {
    const body = {
      name: 'Smoke Brand Phase2',
      website: 'https://example.com',
      phone: '08123456789',
      salesName: 'Phase2',
      salesContact: 'phase2@example.com',
    };
    const res = await request('POST', '/api/brands', { body });
    if (res.ok && res.json && res.json.brand && res.json.brand.id) {
      brandId = res.json.brand.id;
      pushSection(
        lines,
        '0.1',
        'Create Brand (dependency)',
        { method: 'POST', path: '/api/brands', body },
        res,
        `✅ Brand created with id = \`${brandId}\``
      );
    } else {
      pushSection(
        lines,
        '0.1',
        'Create Brand (dependency)',
        { method: 'POST', path: '/api/brands', body },
        res,
        '❌ Failed to create brand. Subsequent product/schedule tests may fail.'
      );
    }
  }

  // 0.2 Create product for schedule items
  {
    const sku = `P2-SMOKE-${Date.now()}`;
    const body = {
      name: 'Smoke Test Tile Phase2',
      sku,
      brandId: brandId || 'MISSING_BRAND',
      categoryName: 'Material',
      subcategoryName: 'Homogeneous Tile',
      dynamicAttributes: {
        size: '600x600',
        finish: 'matt',
        roughness: 'R10',
      },
    };
    const res = await request('POST', '/api/products', { body });
    if (res.ok && res.json && res.json.product && res.json.product.id) {
      productId = res.json.product.id;
      pushSection(
        lines,
        '0.2',
        'Create Product (dependency)',
        { method: 'POST', path: '/api/products', body },
        res,
        `✅ Product created with id = \`${productId}\``
      );
    } else {
      pushSection(
        lines,
        '0.2',
        'Create Product (dependency)',
        { method: 'POST', path: '/api/products', body },
        res,
        '❌ Failed to create product. Schedule item tests may fail.'
      );
    }
  }

  // 1. Create Project
  // -----------------
  {
    const body = {
      name: 'Smoke Test Project Phase 2',
      code: `PRJ-P2-${Date.now()}`,
      clientName: 'Client Smoke P2',
      location: 'Jakarta',
      description: 'Backend Phase 2 smoke test project',
    };
    const res = await request('POST', '/api/projects', { body });
    if (res.ok && res.json && res.json.project && res.json.project.id) {
      projectId = res.json.project.id;
      pushSection(
        lines,
        1,
        'Create Project',
        { method: 'POST', path: '/api/projects', body },
        res,
        `✅ Project created with id = \`${projectId}\``
      );
    } else {
      pushSection(
        lines,
        1,
        'Create Project',
        { method: 'POST', path: '/api/projects', body },
        res,
        '❌ Failed to create project. Subsequent project/schedule tests may fail.'
      );
    }
  }

  // 2. Get Projects list
  // --------------------
  {
    const res = await request('GET', '/api/projects');
    let result = '❌ Failed to get projects list.';
    if (res.ok && res.json && Array.isArray(res.json.projects)) {
      if (projectId && res.json.projects.some((p) => p.id === projectId)) {
        result = `✅ Projects list returned, includes projectId = \`${projectId}\`.`;
      } else {
        result = '⚠ Projects list returned, but newly created project was not clearly found.';
      }
    }
    pushSection(
      lines,
      2,
      'Get Projects List',
      { method: 'GET', path: '/api/projects' },
      res,
      result
    );
  }

  // 3. Get Project Detail
  // ---------------------
  if (!projectId) {
    lines.push('## 3. Get Project Detail');
    lines.push('**Result:** ❌ Skipped: projectId is missing from create project step.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}`;
    const res = await request('GET', path);
    let result = '❌ Failed to get project detail.';
    if (res.ok && res.json && res.json.project && res.json.project.id === projectId) {
      result = '✅ Project detail retrieved.';
    }
    pushSection(
      lines,
      3,
      'Get Project Detail',
      { method: 'GET', path },
      res,
      result
    );
  }

  // 4. Update Project
  // -----------------
  if (!projectId) {
    lines.push('## 4. Update Project');
    lines.push('**Result:** ❌ Skipped: projectId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}`;
    const body = {
      name: 'Smoke Test Project Phase 2 (Updated)',
      location: 'Bandung',
    };
    const res = await request('PATCH', path, { body });
    let result = '❌ Failed to update project.';
    if (res.ok && res.json && res.json.project && res.json.project.name) {
      result = '✅ Project update request accepted.';
    }
    pushSection(
      lines,
      4,
      'Update Project',
      { method: 'PATCH', path, body },
      res,
      result
    );
  }

  // 5. Create Schedule Item A
  // -------------------------
  if (!projectId || !productId) {
    lines.push('## 5. Create Schedule Item A');
    lines.push('**Result:** ❌ Skipped: projectId or productId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items`;
    const body = {
      productId,
      // no code provided: should default to product.internalCode
      area: 'Master Bedroom',
      locationNote: 'Floor',
      usageNote: 'Main tile',
      sortOrder: 1,
    };
    const res = await request('POST', path, { body });
    let result = '❌ Failed to create schedule item A.';
    if (res.ok && res.json && res.json.item && res.json.item.id) {
      itemAId = res.json.item.id;
      itemACode = res.json.item.code;
      result = `✅ Schedule item A created with id = \`${itemAId}\`, code = \`${itemACode}\`.`;
    }
    pushSection(
      lines,
      5,
      'Create Schedule Item A (default code = product.internalCode)',
      { method: 'POST', path, body },
      res,
      result
    );
  }

  // 6. Create Schedule Item B
  // -------------------------
  if (!projectId || !productId) {
    lines.push('## 6. Create Schedule Item B');
    lines.push('**Result:** ❌ Skipped: projectId or productId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items`;
    const explicitCode = itemACode ? `${itemACode}-ALT` : undefined;
    const body = {
      productId,
      code: explicitCode,
      area: 'Living Room',
      locationNote: 'Wall',
      usageNote: 'Accent tile',
      sortOrder: 2,
    };
    const res = await request('POST', path, { body });
    let result = '❌ Failed to create schedule item B.';
    if (res.ok && res.json && res.json.item && res.json.item.id) {
      itemBId = res.json.item.id;
      itemBCode = res.json.item.code;
      result = `✅ Schedule item B created with id = \`${itemBId}\`, code = \`${itemBCode}\`.`;
    }
    pushSection(
      lines,
      6,
      'Create Schedule Item B (explicit code)',
      { method: 'POST', path, body },
      res,
      result
    );
  }

  // 7. List Schedule Items
  // ----------------------
  if (!projectId) {
    lines.push('## 7. List Schedule Items');
    lines.push('**Result:** ❌ Skipped: projectId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items`;
    const res = await request('GET', path);
    let result = '❌ Failed to list schedule items.';
    if (res.ok && res.json && Array.isArray(res.json.items)) {
      const ids = res.json.items.map((i) => i.id);
      const hasA = itemAId && ids.includes(itemAId);
      const hasB = itemBId && ids.includes(itemBId);
      if (hasA && hasB) {
        result = '✅ Schedule items list includes both item A and item B.';
      } else if (hasA || hasB) {
        result = '⚠ Schedule items list includes only one of A/B.';
      } else {
        result = '⚠ Schedule items list returned, but A/B not clearly found.';
      }
    }
    pushSection(
      lines,
      7,
      'List Schedule Items',
      { method: 'GET', path },
      res,
      result
    );
  }

  // 8. Update Schedule Item A
  // -------------------------
  if (!projectId || !itemAId) {
    lines.push('## 8. Update Schedule Item A');
    lines.push('**Result:** ❌ Skipped: projectId or itemAId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items/${itemAId}`;
    const body = {
      area: 'Master Bedroom (Updated)',
      locationNote: 'Floor (Updated)',
    };
    const res = await request('PATCH', path, { body });
    let result = '❌ Failed to update schedule item A.';
    if (res.ok && res.json && res.json.item && res.json.item.area) {
      result = '✅ Schedule item A update request accepted.';
    }
    pushSection(
      lines,
      8,
      'Update Schedule Item A',
      { method: 'PATCH', path, body },
      res,
      result
    );
  }

  // 9. Swap Codes Between Item A and B
  // ----------------------------------
  if (!projectId || !itemAId || !itemBId) {
    lines.push('## 9. Swap Codes Between Item A and B');
    lines.push('**Result:** ❌ Skipped: projectId or itemAId/itemBId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items/swap-codes`;
    const body = {
      itemIdA: itemAId,
      itemIdB: itemBId,
    };
    const res = await request('POST', path, { body });
    let result = '❌ Failed to swap codes between item A and B.';
    if (res.ok && res.json && Array.isArray(res.json.items)) {
      const a = res.json.items.find((i) => i.id === itemAId);
      const b = res.json.items.find((i) => i.id === itemBId);
      if (a && b && a.code && b.code) {
        result = `✅ Swap codes request accepted. New codes: A=\`${a.code}\`, B=\`${b.code}\`.`;
      } else {
        result = '⚠ Swap codes request succeeded but response shape was unexpected.';
      }
    }
    pushSection(
      lines,
      9,
      'Swap Codes Between Item A and B',
      { method: 'POST', path, body },
      res,
      result
    );
  }

  // 10. Delete Schedule Item B
  // --------------------------
  if (!projectId || !itemBId) {
    lines.push('## 10. Delete Schedule Item B');
    lines.push('**Result:** ❌ Skipped: projectId or itemBId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items/${itemBId}`;
    const res = await request('DELETE', path);
    let result = '❌ Failed to delete schedule item B.';
    if (res.ok) {
      result = '✅ Schedule item B delete request accepted.';
    }
    pushSection(
      lines,
      10,
      'Delete Schedule Item B',
      { method: 'DELETE', path },
      res,
      result
    );
  }

  // 11. List Schedule Items After Deletion
  // --------------------------------------
  if (!projectId || !itemBId) {
    lines.push('## 11. List Schedule Items After Deletion');
    lines.push('**Result:** ❌ Skipped: projectId or itemBId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}/items`;
    const res = await request('GET', path);
    let result = '❌ Failed to list schedule items after deletion.';
    if (res.ok && res.json && Array.isArray(res.json.items)) {
      const ids = res.json.items.map((i) => i.id);
      if (!ids.includes(itemBId)) {
        result = '✅ Schedule item B no longer appears in the list.';
      } else {
        result = '⚠ Schedule item B still appears in the list.';
      }
    }
    pushSection(
      lines,
      11,
      'List Schedule Items After Deletion',
      { method: 'GET', path },
      res,
      result
    );
  }

  // 12. (Optional) Delete Project
  // -----------------------------
  if (!projectId) {
    lines.push('## 12. Delete Project');
    lines.push('**Result:** ❌ Skipped: projectId is missing.');
    lines.push('');
  } else {
    const path = `/api/projects/${projectId}`;
    const res = await request('DELETE', path);
    let result = '❌ Failed to delete project.';
    if (res.ok) {
      result = '✅ Project delete request accepted.';
    }
    pushSection(
      lines,
      12,
      'Delete Project (optional cleanup)',
      { method: 'DELETE', path },
      res,
      result
    );
  }

  // Done
  lines.push('---');
  lines.push('Phase 2 smoke tests (Projects + Schedule) completed. Check the results above for PASS/FAIL details.');

  const outPath = 'smoke-test-phase2-projects-log.md';
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  log(`Smoke test Phase 2 complete. Log written to: ${outPath}`);
}

main().catch((err) => {
  console.error('Unexpected error in Phase 2 smoke test:', err);
});
