// Vercel serverless function for deep dive generation
export default function handler(req, res) {
  // Redirect to main server endpoint
  return res.status(308).redirect(`${process.env.MAIN_SERVER_URL}/api/generate-thesis-deep-dive`);
}