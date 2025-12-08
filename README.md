📱 Student Expense Tracker — Final Project (Option A)

This project enhances my original React Native Student Expense Tracker by adding a dynamic Pie Chart that visualizes spending by category. The chart updates automatically whenever expenses are added, edited, or deleted, and a second screen shows a full chart view.

✅ Features

Add, edit, delete expenses saved in SQLite

Filters: All, This Week, This Month

Automatic totals + category totals

New: Pie Chart using react-native-chart-kit

New: Full Chart Screen using React Navigation

Chart pulls from real app data, not hard-coded

▶️ How to Run
npm install
npx expo start


Open in Expo Go.

🤖 Copilot Reflection

I used GitHub Copilot to help generate:

The initial Pie Chart component structure

The navigation boilerplate for the new Chart Screen

Helper code for mapping category totals into chart data

I rejected one Copilot suggestion where it tried to use hard-coded example data for the chart. The assignment requires real dynamic data, so I replaced it with the actual categoryTotals generated from SQLite.

Copilot saved me time by quickly generating repetitive code (like the Stack Navigator setup), letting me focus on customizing the chart and connecting it to real data.
