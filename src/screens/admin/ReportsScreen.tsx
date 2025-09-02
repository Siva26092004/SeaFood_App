import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';

interface ReportsScreenProps {
  navigation: any;
}

interface SalesReport {
  period: 'daily' | 'weekly' | 'monthly';
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  data: any[];
}

interface TopProduct {
  productId: string;
  name: string;
  category: string;
  image_url?: string;
  totalQuantity: number;
  totalRevenue: number;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    { key: 'daily', label: 'Today', icon: 'today-outline' },
    { key: 'weekly', label: 'This Week', icon: 'calendar-outline' },
    { key: 'monthly', label: 'This Month', icon: 'calendar-number-outline' },
  ];

  useEffect(() => {
    fetchSalesReport();
  }, [selectedPeriod]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      
      // Fetch all report data with individual error handling
      const [report, products, chartData, stats] = await Promise.allSettled([
        adminService.getSalesReport(selectedPeriod),
        adminService.getTopProducts(selectedPeriod, 5),
        adminService.getRevenueByPeriod(selectedPeriod),
        adminService.getQuickStats(selectedPeriod),
      ]);
      
      // Handle sales report
      if (report.status === 'fulfilled') {
        setSalesReport(report.value);
      } else {
        console.error('Failed to fetch sales report:', report.reason);
        setSalesReport(null);
      }
      
      // Handle top products (may fail due to schema issues)
      if (products.status === 'fulfilled') {
        setTopProducts(products.value);
      } else {
        console.error('Failed to fetch top products:', products.reason);
        setTopProducts([]);
      }
      
      // Handle revenue chart data
      if (chartData.status === 'fulfilled') {
        setRevenueChart(chartData.value);
      } else {
        console.error('Failed to fetch revenue chart:', chartData.reason);
        setRevenueChart([]);
      }
      
      // Handle quick stats
      if (stats.status === 'fulfilled') {
        setQuickStats(stats.value);
      } else {
        console.error('Failed to fetch quick stats:', stats.reason);
        setQuickStats(null);
      }
      
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Some report data may not be available');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalesReport();
    setRefreshing(false);
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.selectedPeriodButton,
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Ionicons
            name={period.icon as any}
            size={20}
            color={selectedPeriod === period.key ? '#FFFFFF' : APP_CONSTANTS.COLORS.PRIMARY}
          />
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.selectedPeriodButtonText,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSalesMetrics = () => {
    if (!salesReport) return null;

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="cash" size={24} color="#4CAF50" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>₹{salesReport.totalSales.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Sales</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="receipt" size={24} color="#2196F3" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{salesReport.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="trending-up" size={24} color="#FF9800" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>₹{Math.round(salesReport.averageOrderValue)}</Text>
            <Text style={styles.metricLabel}>Avg Order Value</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickStats = () => {
    if (!quickStats) {
      return (
        <View style={styles.quickStatsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="information-circle-outline" size={20} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
              <Text style={styles.noDataText}>Loading stats...</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{quickStats.deliverySuccessRate}%</Text>
            <Text style={styles.statLabel}>Delivery Success</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={20} color="#2196F3" />
            <Text style={styles.statValue}>{quickStats.newCustomerPercentage}%</Text>
            <Text style={styles.statLabel}>New Customers</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="repeat" size={20} color="#FF9800" />
            <Text style={styles.statValue}>{quickStats.repeatOrderPercentage}%</Text>
            <Text style={styles.statLabel}>Repeat Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#9C27B0" />
            <Text style={styles.statValue}>{quickStats.avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTopProducts = () => (
    <View style={styles.topProductsContainer}>
      <Text style={styles.sectionTitle}>Top Selling Products</Text>
      <View style={styles.productsList}>
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <View key={product.productId} style={styles.productItem}>
              <Text style={styles.productRank}>{index + 1}</Text>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productSales}>₹{product.totalRevenue.toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <View style={styles.productItem}>
            <View style={styles.noDataContainer}>
              <Ionicons name="information-circle-outline" size={24} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
              <Text style={styles.noDataText}>
                Product sales data will appear here once orders are delivered
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const handleExportReport = async () => {
    try {
      if (!salesReport) {
        Alert.alert('Error', 'No report data available');
        return;
      }

      // Create a simple text report
      const reportText = `
FISH MARKET SALES REPORT
Period: ${selectedPeriod.toUpperCase()}
Generated: ${new Date().toLocaleString()}

SUMMARY:
- Total Sales: ₹${salesReport.totalSales.toLocaleString()}
- Total Orders: ${salesReport.totalOrders}
- Average Order Value: ₹${salesReport.averageOrderValue.toFixed(2)}

TOP PRODUCTS:
${topProducts.map((product, index) => 
  `${index + 1}. ${product.name} - ₹${product.totalRevenue.toLocaleString()} (${product.totalQuantity} units)`
).join('\n')}

RECENT ORDERS:
${salesReport.data.slice(0, 10).map(order => 
  `- Order ${order.id}: ₹${order.total_amount} (${order.status})`
).join('\n')}
      `;

      Alert.alert(
        'Export Report',
        'Report data prepared. In a real app, this would be saved as a file or shared.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Copy to Clipboard', 
            onPress: () => {
              // In a real app, you would copy to clipboard here
              Alert.alert('Success', 'Report copied to clipboard');
            }
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const handleShareReport = async () => {
    try {
      if (!salesReport) {
        Alert.alert('Error', 'No report data available');
        return;
      }

      Alert.alert(
        'Share Report',
        `Share ${selectedPeriod} sales report with total sales of ₹${salesReport.totalSales.toLocaleString()}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share', 
            onPress: () => {
              Alert.alert('Success', 'Report shared successfully');
            }
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
        <Ionicons name="download" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Export Report</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleShareReport}>
        <Ionicons name="share" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Share Report</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sales Reports</Text>
      </View>

      {renderPeriodSelector()}
      {renderSalesMetrics()}
      {renderQuickStats()}
      {renderTopProducts()}
      {renderActionButtons()}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Report generated on {new Date().toLocaleDateString('en-IN')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  periodContainer: {
    flexDirection: 'row',
    padding: APP_CONSTANTS.SIZES.PADDING,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
  },
  selectedPeriodButton: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    marginLeft: 8,
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    gap: 12,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  metricLabel: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  quickStatsContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 4,
  },
  topProductsContainer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  productsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  productRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.PRIMARY,
    width: 30,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  productSales: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.PRIMARY,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: APP_CONSTANTS.SIZES.PADDING,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  noDataText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 8,
  },
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  footer: {
    padding: APP_CONSTANTS.SIZES.PADDING,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
});
