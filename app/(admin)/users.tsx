import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View
} from 'react-native';
import DataTable from '../components/admin/DataTable';
import adminService, { UserData } from '../services/adminService';
import { colors } from '../styles/theme';

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleViewUser = (user: UserData) => {
    Alert.alert(
      'User Details',
      `ID: ${user.id}\nName: ${user.full_name}\nEmail: ${user.email}\nPhone: ${user.phone_number}\nUsername: ${user.username}\nWallet Balance: Rs. ${user.wallet_balance}\nAdmin: ${user.is_admin ? 'Yes' : 'No'}\nCreated: ${new Date(user.created_at).toLocaleDateString()}`
    );
  };

  const handleToggleStatus = async (user: UserData) => {
    Alert.alert(
      'Change User Status',
      `Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} this user?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: user.is_active ? 'Deactivate' : 'Activate',
          onPress: async () => {
            try {
              const updatedUser = await adminService.updateUserStatus(user.id, !user.is_active);
              setUsers(users.map(u => u.id === user.id ? updatedUser : u));
              Alert.alert('Success', `User has been ${user.is_active ? 'deactivated' : 'activated'}`);
            } catch (error) {
              console.error('Error updating user status:', error);
              Alert.alert('Error', 'Failed to update user status');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (user: UserData) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              setUsers(users.filter(u => u.id !== user.id));
              Alert.alert('Success', 'User has been deleted');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      width: 50,
    },
    {
      id: 'username',
      label: 'Username',
      sortable: true,
    },
    {
      id: 'full_name',
      label: 'Name',
      sortable: true,
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      id: 'wallet_balance',
      label: 'Balance',
      render: (item: UserData) => (
        <Text>Rs. {item.wallet_balance}</Text>
      ),
      sortable: true,
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (item: UserData) => (
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.is_active ? '#4CAF50' : '#9E9E9E' },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View>
      ),
      sortable: true,
    },
    {
      id: 'created_at',
      label: 'Created',
      render: (item: UserData) => (
        <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
      ),
      sortable: true,
    },
  ];

  const getActions = (user: UserData) => {
    const actions = [
      {
        icon: 'eye-outline' as const,
        label: 'View',
        onPress: handleViewUser,
        color: colors.primary,
      },
      {
        icon: user.is_active ? 'close-circle-outline' : 'checkmark-circle-outline' as const,
        label: user.is_active ? 'Deactivate' : 'Activate',
        onPress: handleToggleStatus,
        color: user.is_active ? '#F44336' : '#4CAF50',
      },
    ];

    // Only show delete action for non-admin users
    if (!user.is_admin) {
      actions.push({
        icon: 'trash-outline' as const,
        label: 'Delete',
        onPress: handleDeleteUser,
        color: '#F44336',
      });
    }

    return actions;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} users registered
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          onRowPress={handleViewUser}
          searchable
          searchKeys={['username', 'full_name', 'email']}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          actions={users.length > 0 ? getActions(users[0]) : []}
          emptyMessage="No users found"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  tableContainer: {
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
