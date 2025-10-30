async function loadFlights() {
  try {
    const res = await fetch('/api/proxy');
    const data = await res.json();
    const tbody = document.getElementById('flights');
    tbody.innerHTML = '';
    data.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${f.time}</td><td>${f.flight}</td><td>${f.destination}</td><td>${f.gate||''}</td><td>${f.status}</td><td>${f.logo?'<img src="'+f.logo+'" height="40"/>':''}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Feil ved lasting:', err);
  }
}
loadFlights();
setInterval(loadFlights, 60000);
