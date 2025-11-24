import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function ExpenseScreen() {
  const db = useSQLiteContext();

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const [filter, setFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [editingExpense, setEditingExpense] = useState(null);

  const loadExpenses = async () => {
    const rows = await db.getAllAsync(
      'SELECT * FROM expenses ORDER BY id DESC;'
    );
    setExpenses(rows);
  };
  const addExpense = async () => {
    const amountNumber = parseFloat(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      // Basic validation: ignore invalid or non-positive amounts
      return;
    }

    const trimmedCategory = category.trim();
    const trimmedNote = note.trim();

    if (!trimmedCategory) {
      // Category is required
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    await db.runAsync(
      'INSERT INTO expenses (amount, category, note, date) VALUES (?, ?, ?, ?);',
      [amountNumber, trimmedCategory, trimmedNote || null, today]
    );

    setAmount('');
    setCategory('');
    setNote('');

    loadExpenses();
  };


  const deleteExpense = async (id) => {
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
    loadExpenses();
  };

  function applyFilter(expenses) {
  if (filter === "all") return expenses;

  const now = new Date();

  if (filter === "week") {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    return expenses.filter(e => {
      const d = new Date(e.date);
      return d >= weekStart;
    });
  }

  if (filter === "month") {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
  }

  return expenses;
}
  function calculateTotals(filtered) {
    const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
    setTotal(totalAmount);

    const catTotals = {};
    filtered.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });

    setCategoryTotals(catTotals);
  }

  const saveEdit = async () => {
    if (!editingExpense) return;

    const updated = editingExpense;

    await db.runAsync(
      `UPDATE expenses
       SET amount = ?, category = ?, note = ?
       WHERE id = ?`,
       [
        parseFloat(updated.amount),
        updated.category.trim(),
        updated.note || null,
        updated.id
       ]
    );

    setEditingExpense(null);
    loadExpenses();
  };

  const renderExpense = ({ item }) => (
    <View style={styles.expenseRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseAmount}>${Number(item.amount).toFixed(2)}</Text>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        {item.note ? <Text style={styles.expenseNote}>{item.note}</Text> : null}
      </View>

    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity onPress={() => setEditingExpense(item)}>
        <Text style={[styles.delete, { marginRight: 16, color: "#60a5fa" }]}>✎</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteExpense(item.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
  );

  useEffect(() => {
    async function setup() {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          note TEXT,
          date TEXT NOT NULL
        );
      `);

      await loadExpenses();
    }

    setup();
  }, []);

  useEffect(() => {
    const filtered = applyFilter(expenses);
    calculateTotals(filtered);
  }, [expenses, filter]);


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Student Expense Tracker</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Amount (e.g. 12.50)"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Category (Food, Books, Rent...)"
          placeholderTextColor="#9ca3af"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Note (optional)"
          placeholderTextColor="#9ca3af"
          value={note}
          onChangeText={setNote}
        />
        <Button title="Add Expense" onPress={addExpense} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
        <Button title="All" onPress={() => setFilter("all")} />
        <Button title="This Week" onPress={() => setFilter("week")} />
        <Button title="This Month" onPress={() => setFilter("month")} />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          Total: ${total.toFixed(2)}
        </Text>

        <Text style={{ color: "#fff", marginTop: 8, fontSize: 16, fontWeight: "600" }}>
          By Category:
        </Text>

        {Object.entries(categoryTotals).map(([cat, amt]) => (
        <Text key={cat} style={{ color: "#9ca3af", fontSize: 14 }}>
          {cat}: ${amt.toFixed(2)}
        </Text>
       ))}
      </View>

      {editingExpense && (
        <View style={{
          backgroundColor: "#1f2937",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "#374151"
       }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Edit Expense
          </Text>

          <TextInput
            style={styles.input}
            value={String(editingExpense.amount)}
            keyboardType="numeric"
            onChangeText={(v) => setEditingExpense({ ...editingExpense, amount: v })}
         />

          <TextInput
            style={styles.input}
            value={editingExpense.category}
            onChangeText={(v) => setEditingExpense({ ...editingExpense, category: v })}
         />

          <TextInput
            style={styles.input}
            value={editingExpense.note || ""}
            onChangeText={(v) => setEditingExpense({ ...editingExpense, note: v })}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <Button title="Cancel" color="#9ca3af" onPress={() => setEditingExpense(null)} />
            <Button title="Save" onPress={saveEdit} />
          </View>
        </View>
      )}

      <FlatList
        data={applyFilter(expenses)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpense}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses yet.</Text>
        }
      />

      <Text style={styles.footer}>
        Enter your expenses and they’ll be saved locally with SQLite.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#111827' },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
    gap: 8,
  },
  input: {
    padding: 10,
    backgroundColor: '#1f2937',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  expenseNote: {
    fontSize: 12,
    color: '#9ca3af',
  },
  delete: {
    color: '#f87171',
    fontSize: 20,
    marginLeft: 12,
  },
  empty: {
    color: '#9ca3af',
    marginTop: 24,
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 12,
    fontSize: 12,
  },
});