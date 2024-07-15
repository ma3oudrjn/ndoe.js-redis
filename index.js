const express = require('express');
const app = express();
const redis = require('redis');
const axios = require("axios");

// Create and configure the Redis client
let client = redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

// Middleware to parse JSON
app.use(express.json());

const port = 9200;
app.listen(port, async () => {
    console.log(`Server is running at port: ${port}`);

    // Connect to Redis
    await client.connect();
});

app.get("/photos", async (req, res) => {
    try {
        const data = await checkCash('digikala', async () => {
            const response = await axios.get(
                "https://www.digikala.com/"
            );
            return response.data;
        });

        res.status(200).json(data);
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function checkCash(key, fetchFunction) {
    const data = await client.get(key);
    if (data) {
        console.log("exist");
        return JSON.parse(data);
    } else {
        console.log("not exist");
        const newData = await fetchFunction();
        await client.setEx(key, 3200, JSON.stringify(newData));
        return newData;
    }
}
