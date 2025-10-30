export default async function handler(req, res) {
  try {
    // 1️⃣ Prøv Avinor først
    const avinorRes = await fetch("https://flydata.avinor.no/XmlFeed.asp?TimeFrom=0&TimeTo=24&airport=BGO");
    const xml = await avinorRes.text();

    const flights = [...xml.matchAll(/<flight>(.*?)<\/flight>/gs)].map(m => m[1]);
    let parsed = flights.map(block => {
      const get = tag => (block.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`)) || [])[1] || "";
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

    // 2️⃣ Hvis Avinor er tom -> prøv Flightradar24
    if (parsed.length === 0) {
      const fr24 = await fetch("https://www.flightradar24.com/v1/search/web/find?query=BGO&limit=50");
      const data = await fr24.json();
      parsed = data.results
        ?.filter(r => r.detail && r.detail.flight)
        .map(r => {
          const f = r.detail.flight;
          return {
            time: f.time?.scheduled?.departure || "",
            flight: f.identification?.callsign || "",
            destination: f.airport?.destination?.name || "",
            gate: f.gate || "",
            status: f.status?.text || "",
            logo: `https://cdn.daisycon.io/images/airline/?width=100&height=40&iata=${f.airline?.code?.iata || ""}`
          };
        }) || [];
    }

    res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Feil ved henting av flydata" });
  }
}
