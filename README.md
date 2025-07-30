# **Real-Time Orderbook Viewer & Simulation Tool**

This is a high-performance frontend application built with Next.js that provides a real-time orderbook viewer for multiple cryptocurrency exchanges. It includes powerful order simulation capabilities to help traders visualize market impact and optimal timing before executing a trade.

**Live Demo:** \[Link to your deployed application on Vercel/Netlify\] *(Note: Replace this with your actual link if you deploy it)*

## **Features**

* **Multi-Venue Connectivity**: Establishes real-time WebSocket connections to **OKX**, **Bybit**, and **Deribit**.  
* **Live Orderbook Display**: Renders 15+ levels of best bids and asks, updating instantly as new data arrives.  
* **Dynamic Symbol Switching**: Users can input any trading pair (e.g., ETH-USD, SOL-USD) to fetch its specific orderbook.  
* **Advanced Order Simulation**: A comprehensive form to simulate Market and Limit orders.  
* **Instant Visual Feedback**: Simulated limit orders are immediately highlighted in the orderbook to show their position.  
* **Market Impact Analysis**: Automatically calculates and displays key metrics for simulated market orders, including:  
  * Estimated Fill Price  
  * Slippage Percentage  
  * Fill Percentage  
  * Total Trade Value (Market Impact)  
* **Dual-Theme UI**: A sleek and responsive interface with both **Light** and **Dark** modes.  
* **(Bonus) Market Depth Chart**: A visual representation of cumulative buy and sell pressure, which updates in real-time alongside the orderbook.

## **Tech Stack & Architectural Decisions**

* **Framework**: Next.js (React)  
* **Language**: TypeScript  
* **Styling**: Tailwind CSS (with class-based dark mode)  
* **State Management**: Zustand  
  * *Decision*: I chose Zustand for its simplicity, minimal boilerplate, and excellent performance in handling frequent state updates from multiple WebSocket streams. It avoids the complexity of Redux while providing a centralized, hook-based store.  
* **Data Fetching**: Native WebSocket API  
* **Charting**: Recharts  
* **Icons**: Lucide React

The application is architected around a central useOrderbook custom hook which manages the WebSocket lifecycle, including connection, subscription, and heartbeat messages for each exchange. This isolates the complex data-fetching logic from the UI components.

## **How to Run Locally**

1. **Clone the repository:**  
   git clone \<your-github-repository-url\>

2. **Navigate to the project directory:**  
   cd orderbook-viewer

3. **Install dependencies:**  
   npm install

4. **Run the development server:**  
   npm run dev

5. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

## **API Resources**

* **OKX API:** [https://www.okx.com/docs-v5/](https://www.okx.com/docs-v5/)  
* **Bybit API:** [https://bybit-exchange.github.io/docs/v5/intro](https://bybit-exchange.github.io/docs/v5/intro)  
* **Deribit API:** [https://docs.deribit.com/](https://docs.deribit.com/)