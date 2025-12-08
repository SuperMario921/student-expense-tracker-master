// App.js
import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ChartScreen from './ChartScreen';
import ExpenseScreen from './ExpenseScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName="expenses.db">
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
           name="Expenses"
           component={ExpenseScreen}
           options={{ title: 'Expense Tracker' }}
          />
          <Stack.Screen
           name="Charts"
           component={ChartScreen}
           options={{ title: 'Spending Charts' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
