const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;

        // Validate numeric inputs
        if (minPrice && isNaN(minPrice)) {
            return res.status(400).json({ error: 'minPrice must be a number' });
        }
        if (maxPrice && isNaN(maxPrice)) {
            return res.status(400).json({ error: 'maxPrice must be a number' });
        }
        if (beds && isNaN(beds)) {
            return res.status(400).json({ error: 'beds must be a number' });
        }
        if (baths && isNaN(baths)) {
            return res.status(400).json({ error: 'baths must be a number' });
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'limit must be between 1 and 100' });
        }
        if (offset < 0) {
            return res.status(400).json({ error: 'offset cannot be negative' });
        }

        const conditions = [];
        const values = [];

        if (city) {
            conditions.push('LOWER(TRIM(City)) = LOWER(TRIM(?))');
            values.push(city);
        }
        if (zipcode) {
            conditions.push('PostalCode = ?');
            values.push(zipcode);
        }
        if (minPrice) {
            conditions.push('ListPrice >= ?');
            values.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            conditions.push('ListPrice <= ?');
            values.push(parseFloat(maxPrice));
        }
        if (beds) {
            conditions.push('BedroomsTotal >= ?');
            values.push(parseInt(beds));
        }
        if (baths) {
            conditions.push('BathroomsTotalInteger >= ?');
            values.push(parseInt(baths));
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        const countQuery = `SELECT COUNT(*) as total FROM rets_property ${whereClause}`;
        const [countResult] = await pool.query(countQuery, values);
        const total = countResult[0].total;

        const dataQuery = `SELECT * FROM rets_property ${whereClause} LIMIT ? OFFSET ?`;
        const [results] = await pool.query(dataQuery, [...values, limit, offset]);

        res.json({ total, limit, offset, results });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

module.exports = router;
