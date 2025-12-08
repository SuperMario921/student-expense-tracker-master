import React from "react";
import { View, Text, Dimensions,ScrollView } from "react-native";
import { PieChart } from "react-native-chart-kit";

export default function ChartScreen({ route }) {
    const { categoryTotals } = route.params;

    const screenWidth = Dimensions.get("window").width;

    const chartColors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
    ];

    const data = Object.entries(categoryTotals).map(([category, amount], i) => ({
        name: category,
        amount: amount,
        color: chartColors[i % chartColors.length],
        legendFontColor: "#fff",
        legendFontSize: 14,
    }));

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#111827", padding: 16 }}>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold", marginBottom: 20 }}>
                Spending by Category
            </Text>
            
            <PieChart 
                data={data}
                width={screenWidth - 16}
                height={260}
                chartConfig={{
                    color: () => "#fff",
                    labelColor: () => "#fff",
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="16"
                absolute
            />
        </ScrollView>
    );
}