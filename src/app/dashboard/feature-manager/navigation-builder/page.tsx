"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import { useToast } from "@/lib/toast";

interface NavItem {
  id: string;
  name: string;
  icon: string;
  type: "page" | "container";
  url?: string;
  children: NavItem[];
  expanded: boolean;
}

interface NewItemDialog {
  type: "root" | "child";
  parentId?: string;
}

const commonIcons = [
  "Home",
  "Settings",
  "Users",
  "User",
  "Shield",
  "Folder",
  "Layout",
  "SquareStack",
  "Building",
  "Calendar",
  "Clock",
  "FileText",
  "CreditCard",
  "Briefcase",
  "BookOpen",
  "PieChart",
  "BarChart",
  "Bell",
  "Mail",
  "MessageSquare",
  "HelpCircle",
  "Settings2",
  "Sliders",
  "Lock",
  "Unlock",
  "Database",
  "Globe",
  "Link",
  "Image",
  "Camera",
  "Video",
  "Music",
  "Download",
  "Upload",
  "Plus",
  "Minus",
  "Edit",
  "Trash2",
  "Check",
  "X",
  "ChevronDown",
  "ChevronRight",
  "Circle",
  "Square",
  "Star",
  "Heart",
  "Zap",
  "Sun",
  "Moon",
  "Cloud",
  "MapPin",
  "Phone",
];

const initialNavigation: NavItem[] = [
  {
    id: "1",
    name: "Dashboard",
    icon: "Home",
    type: "page",
    url: "/dashboard",
    children: [],
    expanded: true,
  },
  {
    id: "2",
    name: "Access & Navigation",
    icon: "Settings",
    type: "container",
    children: [
      {
        id: "2-1",
        name: "Features",
        icon: "SquareStack",
        type: "page",
        url: "/dashboard/feature-manager",
        children: [],
        expanded: true,
      },
      {
        id: "2-2",
        name: "Navigation Builder",
        icon: "Layout",
        type: "page",
        url: "/dashboard/feature-manager/navigation-builder",
        children: [],
        expanded: true,
      },
      {
        id: "2-3",
        name: "Role Mapping",
        icon: "Shield",
        type: "page",
        url: "/dashboard/feature-manager/roles",
        children: [],
        expanded: true,
      },
    ],
    expanded: true,
  },
  {
    id: "3",
    name: "Management",
    icon: "Folder",
    type: "container",
    children: [
      {
        id: "3-1",
        name: "Users",
        icon: "Users",
        type: "page",
        url: "/dashboard/users",
        children: [],
        expanded: true,
      },
      {
        id: "3-2",
        name: "Brands",
        icon: "Building",
        type: "page",
        url: "/dashboard/brands",
        children: [],
        expanded: true,
      },
      {
        id: "3-3",
        name: "Teams",
        icon: "Users",
        type: "page",
        url: "/dashboard/teams",
        children: [],
        expanded: true,
      },
    ],
    expanded: true,
  },
];

export default function NavigationBuilderPage() {
  const { addToast } = useToast();
  const [navigation, setNavigation] = useState<NavItem[]>(initialNavigation);
  const [activeItem, setActiveItem] = useState<string>("1");
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [newItemDialog, setNewItemDialog] = useState<NewItemDialog | null>(
    null,
  );
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"page" | "container">(
    "container",
  );
  const [selectedIcon, setSelectedIcon] = useState("Folder");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Circle;
    return <Icon className="w-5 h-5" />;
  };

  const toggleExpand = (itemId: string) => {
    const updateItem = (items: NavItem[]): NavItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, expanded: !item.expanded };
        }
        return { ...item, children: updateItem(item.children) };
      });
    };
    setNavigation(updateItem(navigation));
  };

  const createNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: NavItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      icon: selectedIcon,
      type: newItemType,
      url: newItemType === "page" ? "" : undefined,
      children: [],
      expanded: true,
    };

    if (newItemDialog?.type === "root") {
      setNavigation([...navigation, newItem]);
    } else if (newItemDialog?.type === "child" && newItemDialog.parentId) {
      const addToParent = (items: NavItem[]): NavItem[] => {
        return items.map((item) => {
          if (item.id === newItemDialog.parentId) {
            return {
              ...item,
              expanded: true,
              children: [...item.children, newItem],
            };
          }
          return { ...item, children: addToParent(item.children) };
        });
      };
      setNavigation(addToParent(navigation));
    }

    setNewItemDialog(null);
    setNewItemName("");
    setSelectedIcon("Folder");
    setShowAddMenu(null);
    addToast(
      `${newItemType === "container" ? "Container" : "Page item"} created successfully`,
      "success",
    );
  };

  const updateItem = (itemId: string) => {
    if (!editName.trim()) return;

    const updateValues = (items: NavItem[]): NavItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, name: editName.trim(), icon: editIcon };
        }
        return { ...item, children: updateValues(item.children) };
      });
    };

    setNavigation(updateValues(navigation));
    setEditingItem(null);
    setEditName("");
    setEditIcon("");
  };

  const deleteItem = (itemId: string) => {
    const removeItem = (items: NavItem[]): NavItem[] => {
      return items
        .filter((item) => item.id !== itemId)
        .map((item) => ({
          ...item,
          children: removeItem(item.children),
        }));
    };
    setNavigation(removeItem(navigation));
    addToast("Navigation item deleted", "success");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(navigation, null, 2));
    addToast("JSON copied to clipboard", "success");
  };

  const filteredIcons = commonIcons.filter((icon) =>
    icon.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const renderIconPicker = (
    currentIcon: string,
    onSelect: (icon: string) => void,
    showSearch: boolean = true,
  ) => (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900/50">
      {showSearch && (
        <input
          type="text"
          placeholder="Search icons..."
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          className="w-full px-3 py-1.5 mb-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100"
        />
      )}
      <div className="grid grid-cols-8 gap-1 max-h-[180px] overflow-y-auto">
        {filteredIcons.map((iconName) => {
          const Icon = (Icons as any)[iconName] || Icons.Circle;
          const isSelected = currentIcon === iconName;
          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              className={`p-2 rounded-md transition-colors ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = activeItem === item.id;
    const isEditing = editingItem === item.id;

    if (isEditing) {
      return (
        <div key={item.id} style={{ marginLeft: `${depth * 28}px` }}>
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateItem(item.id)}
              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-700 rounded text-sm text-zinc-900 dark:text-zinc-100"
              placeholder="Item name"
            />
            {renderIconPicker(editIcon, setEditIcon, false)}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => updateItem(item.id)}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEditName("");
                  setEditIcon("");
                }}
                className="px-3 py-1 bg-zinc-500 hover:bg-zinc-600 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className="group">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
          style={{ marginLeft: `${depth * 28}px` }}
          onClick={() => setActiveItem(item.id)}
        >
          <div className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded cursor-grab">
            <Icons.GripVertical className="w-4 h-4 text-zinc-400" />
          </div>

          {item.type === "container" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded"
            >
              <Icons.ChevronDown
                className={`w-4 h-4 text-zinc-500 ${item.expanded ? "" : "-rotate-90"} transition-transform`}
              />
            </button>
          )}

          <span
            className={
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-300"
            }
          >
            {getIcon(item.icon)}
          </span>

          <span
            className={`flex-1 text-sm font-medium ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}
          >
            {item.name}
          </span>

          <div className="relative flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.type === "container" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu(showAddMenu === item.id ? null : item.id);
                }}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-zinc-500 hover:text-blue-600"
                title="Add child item"
              >
                <Icons.Plus className="w-4 h-4" />
              </button>
            )}

            {showAddMenu === item.id && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1 min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewItemDialog({ type: "child", parentId: item.id });
                    setNewItemType("page");
                    setNewItemName("");
                    setSelectedIcon("Circle");
                    setIconSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-left text-zinc-700 dark:text-zinc-300"
                >
                  <Icons.Link className="w-4 h-4" />
                  Add Page Item
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewItemDialog({ type: "child", parentId: item.id });
                    setNewItemType("container");
                    setNewItemName("");
                    setSelectedIcon("Folder");
                    setIconSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-left text-zinc-700 dark:text-zinc-300"
                >
                  <Icons.Folder className="w-4 h-4" />
                  Add Container
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingItem(item.id);
                setEditName(item.name);
                setEditIcon(item.icon);
                setIconSearch("");
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded text-zinc-500 hover:text-zinc-700"
              title="Edit item"
            >
              <Icons.Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-zinc-500 hover:text-red-600"
              title="Delete item"
            >
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {item.type === "container" &&
          item.expanded &&
          item.children.length > 0 && (
            <div>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
      </div>
    );
  };

  const renderPreviewItem = (item: NavItem, depth: number = 0) => {
    const isActive = activeItem === item.id;

    return (
      <div key={item.id}>
        {item.type === "container" ? (
          <div className="mt-1">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              onClick={() => toggleExpand(item.id)}
            >
              <span
                className={
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }
              >
                {getIcon(item.icon)}
              </span>
              <span className="flex-1">{item.name}</span>
              <Icons.ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${item.expanded ? "rotate-180" : ""}`}
              />
            </div>

            {item.expanded && (
              <div className="ml-3 pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-1 mt-1">
                {item.children.map((child) =>
                  renderPreviewItem(child, depth + 1),
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              isActive
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            onClick={() => setActiveItem(item.id)}
          >
            <span
              className={
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }
            >
              {getIcon(item.icon)}
            </span>
            <span>{item.name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Navigation Builder"
      subtitle="Build and preview your navigation structure"
      icon={<Icons.Layout className="w-6 h-6 text-white" />}
    >
      {/* New Item Dialog */}
      {newItemDialog && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setNewItemDialog(null)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xl p-6 w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Add new item
            </h3>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setNewItemType("container");
                  setSelectedIcon("Folder");
                }}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                  newItemType === "container"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icons.Folder className="w-5 h-5" />
                  <span className="text-xs">Container</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setNewItemType("page");
                  setSelectedIcon("Circle");
                }}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                  newItemType === "page"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icons.Link className="w-5 h-5" />
                  <span className="text-xs">Page Item</span>
                </div>
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-3 py-2 mb-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
            />

            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Icon
              </label>
              {renderIconPicker(selectedIcon, setSelectedIcon)}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNewItemDialog(null)}
                className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewItem}
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Navigation Tree Builder */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Navigation Structure
            </h3>
            <button
              onClick={() => {
                setNewItemDialog({ type: "root" });
                setNewItemType("container");
                setNewItemName("");
                setSelectedIcon("Folder");
                setIconSearch("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Icons.Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="p-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => renderNavItem(item))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex justify-end gap-3">
            <button
              onClick={() => setNavigation(initialNavigation)}
              className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() =>
                addToast("Navigation structure saved successfully", "success")
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Live Sidebar Preview */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Live Preview
            </h3>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 h-[600px] overflow-y-auto">
            <div className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Icons.Layout className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    System
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Navigation Preview
                  </p>
                </div>
              </div>

              <nav className="p-2 space-y-1">
                {navigation.map((item) => renderPreviewItem(item))}
              </nav>
            </div>
          </div>
        </div>

        {/* JSON Builder */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              JSON Output
            </h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Icons.Copy className="w-4 h-4" />
              Copy
            </button>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(navigation, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
