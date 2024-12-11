class API {
    constructor(baseURL = 'http://localhost:5001/api') {
        this.baseURL = baseURL;
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}/`, {
                ...options,
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async createUser(username) {
        return this.makeRequest('/user', {
            method: 'POST',
            body: JSON.stringify({ username })
        });
    }

    async scheduleFlight(flightData) {
        return this.makeRequest('/flight', {
            method: 'POST',
            body: JSON.stringify(flightData)
        });
    }

    async getAirports() {
        try {
            const response = await fetch("http://localhost:5001/api/airport/airports"); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("API response for airports:", data);
            return data; // Return the response data
        } catch (error) {
            console.error("Error fetching airports:", error);
            throw error;
        }
    }    

    async getAirportById(id) {
        const response = await fetch(`http://localhost:5001/api/airport/airports/${id}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API response for airports by id:", data);
        return data; // Return the response data
    }

    async getHurdles(level) {
        const response = await fetch(`http://localhost:5001/api/hurdles/${level}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API response for hurdles:", data);
        return data; // Return the response data
    }
    
}

const api = new API();
