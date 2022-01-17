<template>
  <a-table
      :loading="loading"
      :rowKey="(r,i)=>i"
      :columns="columns"
      :pagination="pagination"
      :data-source="data"
      @change="handleTableChange"
  >
    <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
    >
      <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block;"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
      />
      <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
      >
        Поиск
      </a-button>
      <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters, column.dataIndex)">
        Reset
      </a-button>
    </div>
    <template slot="status" slot-scope="status">
      {{ status.title }}
    </template>
  </a-table>
</template>

<script>
import {mapState} from "vuex";

export default {
  data() {
    return {
      columns: [
        {
          title: 'ID',
          dataIndex: 'id',
          sorter: true,
          sortDirections: ['asc', 'desc'],
          customRender: (v,r) => {
            let link = `/mst/${v}`
            if(r.is_autoshop === 1)
              link = `/autoshop/${v}`
            return <router-link to={link}>{v}</router-link>;
          }
        },
        {
          title: 'Номер полиса',
          dataIndex: 'policy_number',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: 'Страхователь',
          dataIndex: 'customer.last_name',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: 'Дата начала',
          dataIndex: 'date_begin',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: 'Дата окончания',
          dataIndex: 'date_end',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: 'Статус',
          dataIndex: 'status',
          key: 'operation',
          width: '200px',
          scopedSlots: { customRender: 'status' },
        }
      ],
      params: {
        filters: {},
        sorter: {},
        pagination: {
          pageSize: 15,
          total: 1519,
          current: 1
        }
      },
    };
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      if(!selectedKeys[0]) return;
      this.params.filters[dataIndex] = selectedKeys[0];
      confirm()
    },
    handleReset(clearFilters, dataIndex) {
      delete this.params.filters[dataIndex];
      clearFilters()
    },
    handleTableChange(pagination, filters, sorter) {
      this.params.sorter = sorter
      this.params.pagination = pagination
      this.loadData()
    },
    loadData() {
      this.$store.dispatch('mst/LOAD_POLICIES', this.params)
    },
  },
  computed: {
    ...mapState('mst', {
      data: state => state.policies,
      loading: state => state.loading,
      pagination: state => state.pagination
    }),
  },
  mounted() {
    this.loadData()
  },
};
</script>

<style scoped>

</style>