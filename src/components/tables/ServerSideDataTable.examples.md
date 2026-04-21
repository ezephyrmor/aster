# ServerSideDataTable Component - Usage Guide

The `ServerSideDataTable` component is a flexible, reusable data table with server-side pagination, sorting, and filtering support. It can be easily adapted for any database table or entity.

## Features

✅ **Server-side pagination** - Efficient handling of large datasets  
✅ **Server-side sorting** - Sort by any column  
✅ **Generic filter system** - Configurable filters for any field  
✅ **Search support** - Global search across records  
✅ **Dark mode** - Full dark mode support  
✅ **Responsive** - Mobile-friendly design  
✅ **Type-safe** - Full TypeScript support with generics  
✅ **Customizable** - Override filters, loading states, and messages

## Basic Usage

### 1. Define Your Data Type

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}
```

### 2. Create Column Definitions

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Username
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => (
      <span className="badge">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <span className={`status-${getValue() as string}`}>
        {getValue() as string}
      </span>
    ),
  },
];
```

### 3. Create Your Component

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { ServerSideDataTable, FilterConfig } from "@/components/ServerSideDataTable";
import { columns, User } from "./UserColumns";
import { PaginationState, SortingState } from "@tanstack/react-table";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // TanStack Table state
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", (tablePagination.pageIndex + 1).toString());
      params.set("limit", tablePagination.pageSize.toString());
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (sorting.length > 0) {
        params.set("sortBy", sorting[0].id);
        params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();

      setUsers(data.users);
      setTotalCount(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [tablePagination, search, roleFilter, statusFilter, sorting]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Build filters
  const filters: FilterConfig[] = [
    {
      id: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
      ],
      value: roleFilter,
      onChange: setRoleFilter,
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  return (
    <ServerSideDataTable
      columns={columns}
      data={users}
      totalCount={totalCount}
      isLoading={loading}
      error={error}
      searchKey="username"
      searchPlaceholder="Search users..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={filters}
      pagination={tablePagination}
      onPaginationChange={setTablePagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
```

## Examples for Different Entities

### Teams Table

```typescript
const filters: FilterConfig[] = [
  {
    id: "department",
    label: "Department",
    type: "select",
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "sales", label: "Sales" },
      { value: "marketing", label: "Marketing" },
    ],
    value: departmentFilter,
    onChange: setDepartmentFilter,
  },
];

<ServerSideDataTable
  columns={teamColumns}
  data={teams}
  totalCount={totalTeams}
  isLoading={loading}
  error={error}
  filters={filters}
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

### Leave Requests Table

```typescript
const filters: FilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
    value: statusFilter,
    onChange: setStatusFilter,
  },
  {
    id: "leaveType",
    label: "Leave Type",
    type: "select",
    options: [
      { value: "sick", label: "Sick Leave" },
      { value: "vacation", label: "Vacation" },
      { value: "personal", label: "Personal" },
    ],
    value: leaveTypeFilter,
    onChange: setLeaveTypeFilter,
  },
];

<ServerSideDataTable
  columns={leaveColumns}
  data={leaves}
  totalCount={totalLeaves}
  isLoading={loading}
  error={error}
  filters={filters}
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

### Brands Table (No Filters)

```typescript
// No filters needed
<ServerSideDataTable
  columns={brandColumns}
  data={brands}
  totalCount={totalBrands}
  isLoading={loading}
  error={error}
  searchKey="name"
  searchPlaceholder="Search brands..."
  searchValue={search}
  onSearchChange={setSearch}
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

### Custom Filter Layout

```typescript
<ServerSideDataTable
  columns={columns}
  data={data}
  totalCount={total}
  isLoading={loading}
  error={error}
  renderFilters={() => (
    <div className="custom-filter-layout">
      {/* Your custom filter UI here */}
      <DatePicker
        value={dateFilter}
        onChange={setDateFilter}
        label="Date Range"
      />
      <MultiSelect
        value={categoryFilters}
        onChange={setCategoryFilters}
        options={categories}
      />
    </div>
  )}
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

## Advanced Customization

### Custom Loading Component

```typescript
<ServerSideDataTable
  // ... other props
  loadingComponent={
    <div className="custom-loader">
      <Spinner />
      <p>Loading data...</p>
    </div>
  }
/>
```

### Custom Empty Message

```typescript
<ServerSideDataTable
  // ... other props
  emptyMessage="No records found. Try adjusting your filters."
/>
```

### Custom Page Size Options

```typescript
<ServerSideDataTable
  // ... other props
  pageSizeOptions={[5, 10, 25, 50, 100]}
/>
```

### Text Filter

```typescript
const filters: FilterConfig[] = [
  {
    id: "department",
    label: "Department",
    type: "text",
    placeholder: "Filter by department...",
    value: departmentFilter,
    onChange: setDepartmentFilter,
  },
];
```

## API Integration Pattern

Your API should accept these query parameters:

```
GET /api/resource?page=1&limit=10&search=query&sortBy=name&sortOrder=asc&filterId=value

Response:
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Tips for Reusability

1. **Keep column definitions separate** - Create a `*Columns.tsx` file for each entity
2. **Use generic types** - The component works with any data type
3. **Configure filters dynamically** - Build filter arrays based on your needs
4. **Leverage the renderFilters prop** - For complex filter UIs
5. **Maintain consistent API patterns** - All your APIs should follow the same query parameter structure

## Benefits

- **One component to rule them all** - Use the same component for users, teams, brands, leaves, infractions, etc.
- **Consistent UX** - All data tables look and behave the same way
- **Easy maintenance** - Fix a bug once, it's fixed everywhere
- **Type safety** - Full TypeScript support with generics
- **Performance** - Server-side pagination handles millions of records
- **Flexibility** - Customize filters, loading states, and messages per use case

The `ServerSideDataTable` is now ready to be used across your entire application!
