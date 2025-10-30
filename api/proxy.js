export default async function handler(req, res) {
  try {
    const avinorRes = await fetch("https://flydata.avinor.no/XmlFeed.asp?TimeFrom=1&TimeTo=12&airport=BGO");
    const xml = await avinorRes.text();

    const flights = [...xml.matchAll(/<flight>(.*?)<\/flight>/gs)].map(m => m[1]);
    const parsed = flights.map(block => {
      const get = tag => (block.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`)) || [])[1] || "";
      const airline = get("airline");
      return {
        time: get("schedule_time"),
        flight: get("flight_id"),
        destination: get("airport_name"),
        gate: get("gate"),
        status: get("status"),
        logo: `https://cdn.daisycon.io/images/airline/?width=100&height=40&iata=${airline}`
      };
    });

    res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Feil ved henting av flydata" });
  }
}
