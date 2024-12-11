class Flight:
    def __init__(
        self,
        flight_id,
        departure_airport_id,
        arrival_airport_id,
        scheduled_departure_time,
        scheduled_arrival_time,
    ):
        self.flight_id = flight_id
        self.departure_airport_id = departure_airport_id
        self.arrival_airport_id = arrival_airport_id
        self.scheduled_departure_time = scheduled_departure_time
        self.scheduled_arrival_time = scheduled_arrival_time
