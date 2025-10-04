const fs = require('fs');
const http = require('http');
const url = require('url');





let productsData = JSON.parse(fs.readFileSync(`${__dirname}/../databaseFolder/products.json`, 'utf-8'));
const admins = JSON.parse(fs.readFileSync(`${__dirname}/../databaseFolder/admins.json`, 'utf-8'));
const supplier = JSON.parse(fs.readFileSync(`${__dirname}/../databaseFolder/supplier.json`, 'utf-8'));
const sales = JSON.parse(fs.readFileSync(`${__dirname}/../databaseFolder/sales.json`, 'utf-8'));
const clients = JSON.parse(fs.readFileSync(`${__dirname}/../databaseFolder/clients.json`, 'utf-8'));


const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname;
  console.log(path);

  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') {
  res.writeHead(204);
  res.end();
  return;
}

if (path === '/products') {
  // ------------------ GET ------------------
  if (req.method === "GET") {
    const query = url.parse(req.url, true).query;

    if (query.id) {
      const product = productsData.find(p => p.productId == query.id);
      if (product) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(product));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Product not found' }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(productsData));
    }
  }

    // ------------------ POST ------------------
  else if (req.method === "POST") {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newProduct = JSON.parse(body);
        newProduct.productId = Date.now(); // إنشاء ID فريد
        productsData.push(newProduct);
        res.writeHead(201, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(newProduct));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }

  // ------------------ PUT ------------------
  else if (req.method === "PUT") {
    const query = url.parse(req.url, true).query;
    if (!query.id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Product ID is required' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updatedProduct = JSON.parse(body);
        const index = productsData.findIndex(p => p.productId == query.id);
        if (index !== -1) {
          productsData[index] = { ...productsData[index], ...updatedProduct };
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify(productsData[index]));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Product not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  }

  // ------------------ DELETE ------------------
  else if (req.method === "DELETE") {
    const query = url.parse(req.url, true).query;
    if (!query.id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Product ID is required' }));
      return;
    }

    const index = productsData.findIndex(p => p.productId == query.id);
    if (index !== -1) {
      const deletedProduct = productsData.splice(index, 1)[0];
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(deletedProduct));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Product not found' }));
    }
  }

  // ------------------ OPTIONS ------------------
  else if (req.method === "OPTIONS") {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
  }

}


 else if (path === '/admins') {
  // ------------------ GET ------------------

    if (req.method === 'GET') {
    const query = url.parse(req.url, true).query;

    if (query.id) {
      const admin = admins.find(c => c.id == query.id);
      if (admin) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(admin));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'admin not found' }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(admins));
    }
  }
  

  // ------------------ CREATE ------------------
  else if (req.method === 'POST') {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const newAdmin = JSON.parse(body);

      // auto increment id
      const newId = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;

      const adminToAdd = {
        id: newId,
        ...newAdmin,
        accountCreated: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active",
      };

      admins.push(adminToAdd);
      fs.writeFileSync(`${__dirname}/../databaseFolder/admins.json`, JSON.stringify(admins, null, 2), 'utf-8');

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Admin created successfully', admin: adminToAdd }));
    });
  }

  // ------------------ UPDATE ------------------
  else if (req.method === 'PUT') {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const updatedData = JSON.parse(body);

      const adminIndex = admins.findIndex(a => a.id === updatedData.id);
      if (adminIndex !== -1) {
        Object.keys(updatedData).forEach(key => {
          if (key !== 'id') { // id ثابت
            admins[adminIndex][key] = updatedData[key];
          }
        });

        admins[adminIndex].lastLogin = new Date().toISOString();

        fs.writeFileSync(
          `${__dirname}/../databaseFolder/admins.json`,
          JSON.stringify(admins, null, 2),
          'utf-8'
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Admin updated successfully',
          admin: admins[adminIndex]
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Admin not found' }));
      }
    });
  }

  // ------------------ DELETE ------------------
  else if (req.method === 'DELETE') {
    const query = url.parse(req.url, true).query;
    const adminIndex = admins.findIndex(el => el.id == query.id);

    if (adminIndex > -1) {
      admins.splice(adminIndex, 1);
      fs.writeFileSync(`${__dirname}/../databaseFolder/admins.json`, JSON.stringify(admins, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Admin deleted successfully' }));
    }
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Admin not found' }));
    }
  }
}
else if (path === '/supplier') {
  // ------------------ GET ------------------
  if (req.method === 'GET') {
    const query = url.parse(req.url, true).query;

    if (query.id) {
      const sup = supplier.find(s => s.id == query.id);
      if (sup) {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(sup));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Supplier not found' }));
      }
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(supplier));
    }
  }

  // ------------------ CREATE ------------------
  else if (req.method === 'POST') {
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const newSupplier = JSON.parse(body);

      // auto increment id
      const newId = supplier.length > 0
        ? Math.max(...supplier.map(s => s.id)) + 1
        : 1;

      const supplierToAdd = {
        id: newId,
        ...newSupplier,
      };

      supplier.push(supplierToAdd);
      fs.writeFileSync(
        `${__dirname}/../databaseFolder/supplier.json`,
        JSON.stringify(supplier, null, 2),
        'utf-8'
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Supplier created successfully',
        supplier: supplierToAdd
      }));
    });
  }

  // ------------------ UPDATE ------------------
  else if (req.method === 'PUT') {
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const updatedData = JSON.parse(body);

      const supIndex = supplier.findIndex(s => s.id === updatedData.id);
      if (supIndex !== -1) {
        Object.keys(updatedData).forEach(key => {
          if (key !== 'id') {
            supplier[supIndex][key] = updatedData[key];
          }
        });

        fs.writeFileSync(
          `${__dirname}/../databaseFolder/supplier.json`,
          JSON.stringify(supplier, null, 2),
          'utf-8'
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Supplier updated successfully',
          supplier: supplier[supIndex]
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Supplier not found' }));
      }
    });
  }

  // ------------------ DELETE ------------------
  else if (req.method === 'DELETE') {
    const query = url.parse(req.url, true).query;
    const supIndex = supplier.findIndex(el => el.id == query.id);

    if (supIndex > -1) {
      supplier.splice(supIndex, 1);
      fs.writeFileSync(
        `${__dirname}/../databaseFolder/supplier.json`,
        JSON.stringify(supplier, null, 2),
        'utf-8'
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Supplier deleted successfully' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Supplier not found' }));
    }
  }
}



else if (path === '/clients') {
  // ------------------ GET ------------------
  if (req.method === 'GET') {
    const query = url.parse(req.url, true).query;

    if (query.id) {
      const client = clients.find(c => c.id == query.id);
      if (client) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(client));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Client not found' }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(clients));
    }
  }

  // ------------------ CREATE ------------------
  else if (req.method === 'POST') {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const newClient = JSON.parse(body);

      // auto increment id
      const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;

      const clientToAdd = {
        id: newId,
        ...newClient,
        accountCreated: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      clients.push(clientToAdd);
      fs.writeFileSync(`${__dirname}/../databaseFolder/clients.json`, JSON.stringify(clients, null, 2), 'utf-8');

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Client created successfully', client: clientToAdd }));
    });
  }

  // ------------------ UPDATE ------------------
  else if (req.method === 'PUT') {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const updatedData = JSON.parse(body);

      const clientIndex = clients.findIndex(c => c.id === updatedData.id);
      if (clientIndex !== -1) {
        Object.keys(updatedData).forEach(key => {
          if (key !== 'id') { // id ثابت
            clients[clientIndex][key] = updatedData[key];
          }
        });

        clients[clientIndex].lastLogin = new Date().toISOString();

        fs.writeFileSync(
          `${__dirname}/../databaseFolder/clients.json`,
          JSON.stringify(clients, null, 2),
          'utf-8'
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Client updated successfully',
          client: clients[clientIndex]
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Client not found' }));
      }
    });
  }

  // ------------------ DELETE ------------------
  else if (req.method === 'DELETE') {
    const query = url.parse(req.url, true).query;
    const clientIndex = clients.findIndex(el => el.id == query.id);

    if (clientIndex > -1) {
      clients.splice(clientIndex, 1);
      fs.writeFileSync(`${__dirname}/../databaseFolder/clients.json`, JSON.stringify(clients, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Client deleted successfully' }));
    }
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Client not found' }));
    }
  }
}


else if (path === '/sales') {
  // ------------------ GET ------------------
  if (req.method === 'GET') {
    const query = url.parse(req.url, true).query;

    if (query.id) {
      const sale = sales.find(c => c.id == query.id);
      if (sale) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(sale));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'invoice not found' }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(sales));
    }
  }

  // ------------------ CREATE ------------------
  else if (req.method === 'POST') {
    let body = [];
    req.on('data', chunk => body.push(chunk));

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const newSale = JSON.parse(body);

      // auto increment id
      const newId = sales.length > 0 ? Math.max(...sales.map(c => c.id)) + 1 : 1;

      const saleToAdd = {
        id: newId,
        ...newSale
      };

      sales.push(saleToAdd);

      fs.writeFileSync(
        `${__dirname}/../databaseFolder/sales.json`,
        JSON.stringify(sales, null, 2),
        'utf-8'
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Sale created successfully', sale: saleToAdd }));
    });
  }

  // ------------------ UPDATE ------------------
  else if (req.method === 'PUT') {
    let body = [];
    req.on('data', chunk => body.push(chunk));

    req.on('end', () => {
      body = Buffer.concat(body).toString();
      const updatedData = JSON.parse(body);

      const saleIndex = sales.findIndex(c => c.id === updatedData.id);
      if (saleIndex !== -1) {
        Object.keys(updatedData).forEach(key => {
          if (key !== 'id') sales[saleIndex][key] = updatedData[key];
        });

        fs.writeFileSync(
          `${__dirname}/../databaseFolder/sales.json`,
          JSON.stringify(sales, null, 2),
          'utf-8'
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Sale updated successfully', sale: sales[saleIndex] }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'invoice not found' }));
      }
    });
  }

  // ------------------ DELETE ------------------
  else if (req.method === 'DELETE') {
    const query = url.parse(req.url, true).query;
    const saleIndex = sales.findIndex(el => el.id == query.id);

    if (saleIndex > -1) {
      sales.splice(saleIndex, 1);
      fs.writeFileSync(
        `${__dirname}/../databaseFolder/sales.json`,
        JSON.stringify(sales, null, 2)
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Sale deleted successfully' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'sale not found' }));
    }
  }
}







  else {
    res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ message: "not found" }));
  }
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



