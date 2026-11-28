export async function previewRequest(body) {
  const response = await fetch('/deal-preview/access', {method:'POST', credentials:'same-origin',
    headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), cache:'no-store',signal:AbortSignal.timeout(15000)});
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'unavailable');
  return data;
}
