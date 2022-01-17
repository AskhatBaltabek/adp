<template>
  <div>
    <a-page-header
        style="border: 1px solid rgb(235, 237, 240)"
        title="Роли пользователя"
    />
    <a-transfer
        :titles="['Все роли', 'Имеющиеся роли']"
        :data-source="roles"
        :target-keys="targetKeys"
        :rowKey="r => r.id"
        :disabled="false"
        :show-search="true"
        :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
        :show-select-all="false"
        @change="onChange"
    >
      <template
          slot="children"
          slot-scope="{
          props: { direction, filteredItems, selectedKeys, disabled: listDisabled },
          on: { itemSelectAll, itemSelect },
        }"
      >
        <a-table
            :row-selection="getRowSelection({ disabled: listDisabled, selectedKeys, itemSelectAll, itemSelect })"
            :columns="direction === 'left' ? leftColumns : rightColumns"
            :data-source="filteredItems"
            :row-key="row => row.id"
            size="small"
        />
      </template>
    </a-transfer>
  </div>
</template>
<script>
import difference from 'lodash/difference';
import {mapGetters, mapState} from "vuex";

const leftTableColumns = [
  {
    dataIndex: 'title',
    title: 'Название',
  },
  {
    dataIndex: 'description',
    title: 'Описание',
  },
];
const rightTableColumns = [
  {
    dataIndex: 'title',
    title: 'Название',
  },
];

export default {
  data() {
    return {
      disabled: false,
      showSearch: false,
      targetKeys: [],
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
    };
  },
  methods: {
    onChange(nextTargetKeys) {
      this.targetKeys = nextTargetKeys;
    },

    triggerDisable(disabled) {
      this.disabled = disabled;
    },

    triggerShowSearch(showSearch) {
      this.showSearch = showSearch;
    },
    getRowSelection({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
      return {
        getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
              .filter(item => !item.disabled)
              .map(({ id }) => id);
          const diffKeys = selected
              ? difference(treeSelectedKeys, selectedKeys)
              : difference(selectedKeys, treeSelectedKeys);
          itemSelectAll(diffKeys, selected);
        },
        onSelect({ id }, selected) {
          itemSelect(id, selected);
        },
        selectedRowKeys: selectedKeys,
      };
    },
    async getRoles() {
      await this.$store.dispatch('users/LOAD_ROLES')
    }
  },
  mounted() {
    this.getRoles()
  },
  computed: {
    ...mapState('users', {
      user: state => state.user,
      roles: state => state.roles
    }),
    targetKeys: {
      get: {

      }
    }
  }
};
</script>
