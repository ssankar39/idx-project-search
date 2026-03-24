const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');

function validateListingId(id) {
    if (!id || id.trim() === '') {
        return { valid: false, error: 'Listing ID is required' };
    }
    if (id.length > 50) {
        return { valid: false, error: 'Listing ID is too long' };
    }
    return { valid: true };
}

router.get('/:id/openhouses', async (req, res) => {
    try {
        const { id } = req.params;
        const validation = validateListingId(id);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const [propertyCheck] = await pool.query(
            'SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?',
            [id]
        );
        if (propertyCheck.length === 0) {
            return res.status(404).json({
                error: 'Property not found',
                message: `No property exists with ID: ${id}`
            });
        }

        const [openhouses] = await pool.query(
            'SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate, OH_StartTime',
            [id]
        );

        res.json({
            propertyId: id,
            count: openhouses.length,
            openhouses
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch open houses' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const validation = validateListingId(id);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const [results] = await pool.query(
            'SELECT * FROM rets_property WHERE L_ListingID = ?',
            [id]
        );
        if (results.length === 0) {
            return res.status(404).json({
                error: 'Property not found',
                message: `No property exists with ID: ${id}`
            });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch property details' });
    }
});

router.get('/', async (req, res) => {
    try {
        const hasLimit = req.query.limit !== undefined;
        const hasOffset = req.query.offset !== undefined;
        const limit = hasLimit ? parseInt(req.query.limit, 10) : 20;
        const offset = hasOffset ? parseInt(req.query.offset, 10) : 0;
        const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;

        const normalizedCity = city === undefined ? undefined : String(city).trim();
        const normalizedZipcode = zipcode === undefined ? undefined : String(zipcode).trim();

        const hasMinPrice = minPrice !== undefined && minPrice !== '';
        const hasMaxPrice = maxPrice !== undefined && maxPrice !== '';
        const hasBeds = beds !== undefined && beds !== '';
        const hasBaths = baths !== undefined && baths !== '';

        const minPriceValue = hasMinPrice ? Number(minPrice) : null;
        const maxPriceValue = hasMaxPrice ? Number(maxPrice) : null;
        const bedsValue = hasBeds ? Number(beds) : null;
        const bathsValue = hasBaths ? Number(baths) : null;

        if (hasLimit && Number.isNaN(limit)) {
            return res.status(400).json({ error: 'limit must be a number' });
        }
        if (hasOffset && Number.isNaN(offset)) {
            return res.status(400).json({ error: 'offset must be a number' });
        }

        // Validate numeric inputs
        if (hasMinPrice && !Number.isFinite(minPriceValue)) {
            return res.status(400).json({ error: 'minPrice must be a number' });
        }
        if (hasMaxPrice && !Number.isFinite(maxPriceValue)) {
            return res.status(400).json({ error: 'maxPrice must be a number' });
        }
        if (hasBeds && (!Number.isInteger(bedsValue) || bedsValue < 0 || bedsValue > 50)) {
            return res.status(400).json({ error: 'beds must be a number' });
        }
        if (hasBaths && (!Number.isInteger(bathsValue) || bathsValue < 0 || bathsValue > 50)) {
            return res.status(400).json({ error: 'baths must be a number' });
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'limit must be between 1 and 100' });
        }
        if (offset < 0) {
            return res.status(400).json({ error: 'offset cannot be negative' });
        }
        if (hasMinPrice && minPriceValue < 0) {
            return res.status(400).json({ error: 'minPrice must be 0 or greater' });
        }
        if (hasMaxPrice && maxPriceValue < 0) {
            return res.status(400).json({ error: 'maxPrice must be 0 or greater' });
        }
        if (hasMinPrice && hasMaxPrice && minPriceValue > maxPriceValue) {
            return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
        }
        if (normalizedCity !== undefined) {
            if (!normalizedCity) {
                return res.status(400).json({ error: 'city cannot be empty' });
            }
            if (normalizedCity.length > 100) {
                return res.status(400).json({ error: 'city is too long' });
            }
        }
        if (normalizedZipcode !== undefined) {
            const zipRegex = /^\d{5}(?:-\d{4})?$/;
            if (!zipRegex.test(normalizedZipcode)) {
                return res.status(400).json({ error: 'zipcode must be in 12345 or 12345-6789 format' });
            }
        }

        const conditions = [];
        const values = [];

        if (normalizedCity) {
            conditions.push('LOWER(TRIM(L_City)) = LOWER(TRIM(?))');
            values.push(normalizedCity);
        }
        if (normalizedZipcode) {
            conditions.push('L_Zip = ?');
            values.push(normalizedZipcode);
        }
        if (hasMinPrice) {
            conditions.push('L_SystemPrice >= ?');
            values.push(minPriceValue);
        }
        if (hasMaxPrice) {
            conditions.push('L_SystemPrice <= ?');
            values.push(maxPriceValue);
        }
        if (hasBeds) {
            conditions.push('LM_Int2_3 >= ?');
            values.push(bedsValue);
        }
        if (hasBaths) {
            conditions.push('BathroomsHalf >= ?');
            values.push(bathsValue);
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
