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
    <template slot="operation" slot-scope="id, record">
      <a-tooltip v-if="record.roles.some(i => i.title === 'Agent' || i.title === 'Subagent')" placement="left" title="Отправить пароль менеджеру">
        <a-popconfirm
            title="Вы уверены?"
            ok-text="Да"
            cancel-text="Нет"
            @confirm="sendPassword(record.id)"
            @cancel="cancel"
        >
          <a-button icon="unlock" type="primary"/>
        </a-popconfirm>
      </a-tooltip>
    </template>
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
          customRender: (v) => {
            let link = `/users/${v}`
            return <router-link to={link}>{v}</router-link>;
          }
        },
        {
          title: 'ФИО',
          dataIndex: 'name',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: 'Email',
          dataIndex: 'email',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: 'Телефон',
          dataIndex: 'mobile_phone',
          type: 'text',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: '',
          scopedSlots: { customRender: 'operation' },
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
    async sendPassword(id) {
      try {
        let data = await this.$store.dispatch('users/SEND_PASSWORD', id);
        this.$message.success(data.message)
      } catch (e) {
        this.$message.error(e.message)
      }

    },
    cancel() {
      return false;
    },
    loadData() {
      this.$store.dispatch('users/LOAD_USERS', this.params)
    },
  },
  computed: {
    ...mapState('users', {
      data: state => state.users,
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