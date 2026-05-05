<script setup lang="ts">
import { ref, computed } from 'vue'
import { MOCK_COLLECTION, type CollectionEntry } from '@/Mocks/collectionMocks'
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

// ─── Types ───────────────────────────────────────────────────

type SortDir = 'asc' | 'desc' | null
type SortKey = keyof CollectionEntry | null

interface Column {
  key: keyof CollectionEntry
  label: string
  type: 'string' | 'number' | 'boolean' | 'date'
  sortable: boolean
  editable: boolean
}

// ─── Column definitions ──────────────────────────────────────
// Each column knows its type so we can render/edit it correctly

const columns: Column[] = [
  { key: 'id',                label: 'ID',               type: 'string',  sortable: false, editable: false },
  { key: 'name',              label: 'Name',             type: 'string',  sortable: true,  editable: true  },
  { key: 'age',               label: 'Age',              type: 'number',  sortable: true,  editable: true  },
  { key: 'is_admin',          label: 'Admin',            type: 'boolean', sortable: true,  editable: true  },
  { key: 'registration_date', label: 'Registered',       type: 'date',    sortable: true,  editable: false },
]

// ─── State ───────────────────────────────────────────────────

const data = ref<CollectionEntry[]>([...MOCK_COLLECTION])
const sortKey = ref<SortKey>(null)
const sortDir = ref<SortDir>(null)
const currentPage = ref(1)
const pageSizeOptions = [10, 25, 50, 100]
const pageSize = ref(50)

// Which cell is being edited: { rowId, colKey }
const editingCell = ref<{ rowId: string; colKey: keyof CollectionEntry } | null>(null)
const editingValue = ref<string>('')

// ─── Sorting ─────────────────────────────────────────────────

function toggleSort(key: keyof CollectionEntry) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortKey.value = null
    sortDir.value = null
  }
  currentPage.value = 1
}

const sortedData = computed(() => {
  if (!sortKey.value || !sortDir.value) return data.value

  return [...data.value].sort((a, b) => {
    const aVal = a[sortKey.value!]
    const bVal = b[sortKey.value!]

    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return sortDir.value === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime()
    }

    // Handle booleans
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return sortDir.value === 'asc'
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal)
    }

    // Handle strings and numbers
    if (aVal < bVal) return sortDir.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})

// ─── Pagination ───────────────────────────────────────────────

const totalPages = computed(() => Math.ceil(sortedData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedData.value.slice(start, start + pageSize.value)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// ─── Editing ─────────────────────────────────────────────────

function startEdit(row: CollectionEntry, col: Column) {
  if (!col.editable) return

  // If already editing a different cell, cancel it first
  if (editingCell.value &&
      (editingCell.value.rowId !== row.id || editingCell.value.colKey !== col.key)) {
    cancelEdit()
  }
  editingCell.value = { rowId: row.id, colKey: col.key }

  const val = row[col.key]

  if (val instanceof Date) {
    editingValue.value = val.toISOString().slice(0, 10)
  } else {
    editingValue.value = String(val)
  }
}

function commitEdit(row: CollectionEntry, col: Column) {
  if (!editingCell.value) return

  let newValue: string | number | boolean = editingValue.value

  if (col.type === 'number') newValue = Number(editingValue.value)
  if (col.type === 'boolean') newValue = editingValue.value === 'true'

  // This is where you'd call the real update function:
  onUpdate(row.id, col.key, newValue)

  editingCell.value = null
}

function cancelEdit() {
  editingCell.value = null
}

/**
 * Update handler — called instead of mutating data directly.
 * Replace this with a real DATEX update call later.
 */
function onUpdate(id: string, property: keyof CollectionEntry, newValue: unknown) {
  console.log('[CollectionTable] update:', { id, property, newValue })
  const entry = data.value.find(e => e.id === id)
  if (entry) {
    (entry as Record<string, unknown>)[property] = newValue
  }
}

// ─── Rendering helpers ────────────────────────────────────────

function formatCell(value: unknown, type: Column['type']): string {
  if (type === 'date' && value instanceof Date) {
    return value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }
  if (type === 'boolean') return ''  // rendered as toggle
  return String(value ?? '')
}

function isEditing(rowId: string, colKey: keyof CollectionEntry): boolean {
  return editingCell.value?.rowId === rowId && editingCell.value?.colKey === colKey
}
</script>

<template>
  <div class="flex flex-col h-full p-4 gap-4">
    <h1 class="text-2xl font-bold text-foreground">Collection</h1>

    <!-- Table wrapper -->
    <div class="rounded-lg border border-border overflow-hidden flex-1">
      <div class="overflow-x-auto h-full">
        <table class="w-full text-sm table-fixed">
          <!-- Header -->
          <thead class="bg-muted/50 border-b border-border">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap select-none"
                :class="{ 'cursor-pointer hover:text-foreground transition-colors': col.sortable }"
                @click="col.sortable ? toggleSort(col.key) : null"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <template v-if="col.sortable">
                    <ArrowUp v-if="sortKey === col.key && sortDir === 'asc'" class="size-3 text-foreground" />
                    <ArrowDown v-else-if="sortKey === col.key && sortDir === 'desc'" class="size-3 text-foreground" />
                    <ArrowUpDown v-else class="size-3 opacity-30" />
                  </template>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              v-for="row in paginatedData"
              :key="row.id"
              class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-2 text-foreground"
                :class="{ 'cursor-pointer hover:bg-muted/50': col.editable && !isEditing(row.id, col.key) }"
                @click.stop="startEdit(row, col)"
              >
                <!-- Editing state -->
                <template v-if="isEditing(row.id, col.key)">
                  <!-- Boolean toggle -->
                  <select
                    v-if="col.type === 'boolean'"
                    v-model="editingValue"
                    class="bg-transparent text-sm text-foreground w-full outline-none border-none p-0 m-0 h-auto leading-normal"                    @keydown.enter="commitEdit(row, col)"
                    @keydown.escape="cancelEdit"
                    autofocus
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>

                  <!-- Number/String input -->
                  <input
                    v-else
                    v-model="editingValue"
                    :type="col.type === 'number' ? 'number' : 'text'"
                    class="bg-transparent text-sm text-foreground w-full outline-none border-none p-0 m-0 h-auto leading-normal [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @keydown.enter="commitEdit(row, col)"
                    @keydown.escape="cancelEdit"
                    @keydown.up.prevent="col.type === 'number' && (editingValue = String(Number(editingValue) + 1))"
                    @keydown.down.prevent="col.type === 'number' && (editingValue = String(Number(editingValue) - 1))"
                     autofocus
                  />
                </template>

                <!-- Display state -->
                <template v-else>
                  <!-- Boolean pill -->
                  <span
                    v-if="col.type === 'boolean'"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="row[col.key] ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'"
                  >
                    {{ row[col.key] ? 'Yes' : 'No' }}
                  </span>

                  <!-- ID — monospace truncated -->
                  <span v-else-if="col.key === 'id'" class="font-mono text-xs text-muted-foreground truncate block max-w-32">
                    {{ row.id }}
                  </span>

                  <!-- Everything else -->
                  <span v-else>{{ formatCell(row[col.key], col.type) }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination bar -->
    <div class="flex items-center justify-between text-sm text-muted-foreground">
  <div class="flex items-center gap-3">
    <span>
      Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, data.length) }} of {{ data.length }} entries
    </span>
    <div class="flex items-center gap-2">
      <span>Rows per page:</span>
      <select
        v-model.number="pageSize"
        @change="currentPage = 1"
        class="bg-background border border-border rounded px-2 py-0.5 text-foreground"
      >
        <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>
  </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <ChevronLeft class="size-3.5" />
          Previous
        </button>
        <span class="text-foreground font-medium">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          Next
          <ChevronRight class="size-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>