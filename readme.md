# Dokumentasi API: Kategori dan Produk

API ini menyediakan fungsi untuk mengelola kategori, produk, memperbarui jumlah produk terjual, dan menghitung omzet harian berdasarkan kategori.

---

## Endpoint

### 1. **POST /api/categories**

**Deskripsi**: Menambah kategori baru ke sistem.

**Body Request**:

```
{
"name": "Nama Kategori"
}
```

**Response (200 OK)**:

```
{
"message": "Kategori berhasil ditambahkan",
"categoryId": 1
}
```

---

### 2. **GET /api/categories**

**Deskripsi**: Mengambil daftar semua kategori.

**Response (200 OK)**:

```
[
{
"categoryId": 1,
"name": "Kedai Kopi Seruput"
},
{
"categoryId": 2,
"name": "Kedai Kopi Lain"
}
]
```

---

### 3. **POST /api/products/<categoryId>**

**Deskripsi**: Menambah produk baru ke dalam kategori tertentu.

**URL Parameters**:

- `categoryId`: ID kategori tempat produk akan ditambahkan.

**Body Request**:

```
{
"name": "Nama Produk",
"price": 10000,
"photo": "url_foto"
}
```

**Response (200 OK)**:

```
{
"message": "Produk berhasil ditambahkan",
"productId": 1
}
```

---

### 4. **GET /api/products/<categoryId>**

**Deskripsi**: Mengambil daftar produk dalam kategori tertentu.

**URL Parameters**:

- `categoryId`: ID kategori yang produk-produknya akan diambil.

**Response (200 OK)**:

```
[
{
"productId": 1,
"name": "Americano",
"price": 10000,
"photo": "url_foto",
"sold": 10
},
{
"productId": 2,
"name": "Cappuccino",
"price": 12000,
"photo": "url_foto",
"sold": 5
}
]
```

---

### 5. **PUT /api/products/sold/<productId>**

**Deskripsi**: Memperbarui jumlah produk yang telah terjual.

**URL Parameters**:

- `productId`: ID produk yang jumlah terjualnya ingin diperbarui.

**Body Request**:

```
{
"amountSold": 5
}
```

**Response (200 OK)**:

```
{
"message": "Jumlah terjual berhasil diperbarui",
"productId": 1,
"amountSold": 15
}
```

---

### 6. **GET /api/products/revenue/<categoryId>**

**Deskripsi**: Menghitung omzet harian untuk kategori tertentu.

**URL Parameters**:

- `categoryId`: ID kategori yang omzet hariannya ingin dihitung.

**Response (200 OK)**:

```
{
"date": "2024-12-03",
"revenue": 100000
}
```

---

### 7. **GET /api/daily-sales**

**Deskripsi**: Mengambil data omzet berdasarkan tanggal, bulan, atau seluruh data omzet.

#### Omzet berdasarkan tanggal:

```
GET http://localhost:5000/api/daily-sales?date=2024-12-06
```

#### Omzet berdasarkan bulan:

```
GET http://localhost:5000/api/daily-sales?month=2024-12
```

#### Semua data omzet:

```
GET http://localhost:5000/api/daily-sales
```

**Response (200 OK)**:

```
{
"data": [
{
"date": "2024-12-03",
"revenue": 100000
},
{
"date": "2024-12-04",
"revenue": 150000
}
]
}
```

---

## Cara Menjalankan Server

Pastikan Anda sudah menginstal Node.js dan `nodemon` pada sistem Anda. Jalankan perintah berikut:

```
npx nodemon server.js
```

---

## Tes Endpoint

Gunakan alat seperti **Postman** atau **Insomnia** untuk menguji endpoint berikut:

- **POST /api/categories**: Menambah kategori baru.
- **GET /api/categories**: Melihat daftar kategori.
- **POST /api/products/<categoryId>**: Menambah produk ke kategori tertentu.
- **GET /api/products/<categoryId>**: Melihat produk dalam kategori.
- **PUT /api/products/sold/<productId>**: Memperbarui jumlah produk terjual.
- **GET /api/products/revenue/<categoryId>**: Menghitung omzet harian kategori.
- **GET /api/daily-sales**: Melihat omzet berdasarkan tanggal, bulan, atau semua data.

---

## Catatan

Pastikan mengganti parameter dinamis seperti `<categoryId>` dan `<productId>` dengan ID yang sesuai saat menguji API.
