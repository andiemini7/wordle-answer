import fs from "fs";

async function getTodayWordle() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  
  // Use the official NYT Wordle API endpoint
  const apiUrl = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      date: data.print_date,
      answer: data.solution.toUpperCase(),
      id: data.id,
      days_since_launch: data.days_since_launch,
      editor: data.editor
    };
  } catch (error) {
    throw new Error(`Failed to fetch Wordle data: ${error.message}`);
  }
}

(async () => {
  const todayWordle = await getTodayWordle();
  fs.writeFileSync("today.json", JSON.stringify(todayWordle, null, 2));
  
  // Update HTML file with current data for meta tags
  let html = fs.readFileSync("index.html", "utf8");
  
  const titleText = `Wordle #${todayWordle.id} - ${todayWordle.date}`;
  const descText = `Today's Wordle answer is: ${todayWordle.answer}`;
  const pageTitle = `Today's Wordle: ${todayWordle.answer}`;
  
  // Update page title
  html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);
  
  // Update Open Graph tags
  html = html.replace(/(<meta property="og:title"[^>]*content=")[^"]*/, `$1${titleText}`);
  html = html.replace(/(<meta property="og:description"[^>]*content=")[^"]*/, `$1${descText}`);
  
  // Update Twitter tags
  html = html.replace(/(<meta name="twitter:title"[^>]*content=")[^"]*/, `$1${titleText}`);
  html = html.replace(/(<meta name="twitter:description"[^>]*content=")[^"]*/, `$1${descText}`);
  
  // Update the word display in the HTML
  html = html.replace(/(<p id="word">)Loading\.\.\.(<\/p>)/, `$1${todayWordle.answer}$2`);
  
  fs.writeFileSync("index.html", html);
  
  console.log("Updated today.json:", todayWordle);
  console.log("Updated index.html with meta tags and content");
})();
