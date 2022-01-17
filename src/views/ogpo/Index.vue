<template>
  <div>
    <router-link to="/ogpo/create">
      <a-button type="primary" icon="plus-circle">Создать полис</a-button>
    </router-link>

    <a-divider />

    <a-table
      :columns="columns"
      :data-source="policies"
      row-key="id"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <span slot="status" slot-scope="status">{{ statuses[status] }}</span>
      <a slot="actions" slot-scope="text" @click="showPolicy(text)">Посмотреть</a>

      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Искать ${column.title}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block;"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm, column.key)"
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="() => handleSearch(selectedKeys, confirm, column.key)"
        >Искать</a-button>
        <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">Сбросить</a-button>
      </div>

      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />

      <template slot="customRender" slot-scope="text, record, index, column">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template
            v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
          >
            <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight"
            >{{ fragment }}</mark>
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>
          {{ text }}
        </template>
      </template>

      <div
        slot="expandedRowRender"
        slot-scope="record"
      >
        <div>
          <h3>Страхователь:</h3>
          <table>
            <thead>
              <tr>
                <th>ИИН/БИН</th>
                <th>ФИО/Наименование</th>
                <th>Дата рождения</th>
                <th>Является юр. лицом</th>
                <th>Является резидентом</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ record.holder.iin }}</td>
                <td>{{ record.holder.person_name }}</td>
                <td>{{ record.holder.born ? record.holder.born : '-' }}</td>
                <td>{{ +record.holder.natural_person_bool ? 'Нет' : 'Да' }}</td>
                <td>{{ +record.holder.resident_bool ? 'Да' : 'Нет' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 15px;">
          <h3>Список застрахованных:</h3>
          <div v-if="!+record.holder.natural_person_bool">ЛИЦА, НА ОСНОВАНИИ ПУТЕВЫХ ЛИСТОВ И/ИЛИ ДОВЕРЕННОСТИ ВЫДАННЫХ СТРАХОВАТЕЛЕМ</div>
          <table v-else>
            <thead>
              <tr>
                <th>ИИН/БИН</th>
                <th>ФИО/Наименование</th>
                <th>Дата рождения</th>
                <th>Является юр. лицом</th>
                <th>Является резидентом</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="insured in record.insured_people" :key="insured.iin">
                <td>{{ insured.iin }}</td>
                <td>{{ insured.person_name }}</td>
                <td>{{ insured.born ? insured.born : '-' }}</td>
                <td>{{ +insured.natural_person_bool ? 'Нет' : 'Да' }}</td>
                <td>{{ +insured.resident_bool ? 'Да' : 'Нет' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 15px;">
          <h3>Список ТС:</h3>
          <table>
            <thead>
              <tr>
                <th>Гос. номер</th>
                <th>VIN</th>
                <th>Марка</th>
                <th>Модель</th>
                <th>Год выпуска</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in record.vehicles" :key="vehicle.reg_num">
                <td>{{ vehicle.reg_num }}</td>
                <td>{{ vehicle.vin }}</td>
                <td>{{ vehicle.mark }}</td>
                <td>{{ vehicle.model }}</td>
                <td>{{ vehicle.year }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </a-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  data() {
    return {
      columns: [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          scopedSlots: { customRender: 'id' },
          sorter: true
        },
        {
          title: 'Номер полиса',
          dataIndex: 'policy_number',
          key: 'policy_number',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          }
        },
        { title: 'Дата начала', dataIndex: 'started_at', key: 'started_at' },
        { title: 'Дата окончания', dataIndex: 'ended_at', key: 'ended_at' },
        { title: 'Страховая премия', dataIndex: 'insurance_premium', key: 'insurance_premium' },
        {
          title: 'Статус',
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: 'Действия',
          dataIndex: 'id',
          key: 'actions',
          scopedSlots: { customRender: 'actions' }
        },
      ],
      policies: [],
      statuses: {
        0: 'Черновик',
        1: 'Переоформлен со сменой',
        2: 'Переоформлен',
        3: 'Расторгнут',
        4: 'Выпущен дубликат',
        5: 'Отменен',
        6: 'Ошибка оператора',
        7: 'На проверке',
        8: 'Выписан',
        9: 'Пролонгирован',
        10: 'Ожидание оплаты',
        11: 'Оплачен',
        12: 'Недействителен'
      },
      pagination: {
        current: 1,
        pageSize: 1,
        total: 1
      },
      searchText: '',
      searchInput: null,
      searchedColumn: '',
    };
  },

  methods: {
    ...mapActions('ogpo', [
      'getPolicies',
      'createPolicyBasedOnExisting',
    ]),

    async showPolicy(id) {
      if (id) {
        this.$router.push({ name: 'ogpo.show', params: { id: id } });
      } else if (this.searchedColumn === 'policy_number' && this.searchText.length === 18) {
        let rp = await this.createPolicyBasedOnExisting({ 'policy_number': this.searchText });

        if (rp.success) {
          this.$router.push({ name: 'ogpo.show', params: { id: rp.data.policy_id } });
        } else {
          this[rp.dialog]({ title: rp.message });
        }
      }
    },

    handleTableChange(pagination, filters, sorter) {
      let params = {
        page: pagination.current
      };

      if (this.searchedColumn && this.searchText) {
        params.search = {
          'column': this.searchedColumn,
          'text': this.searchText
        };
      }

      if (!isEmpty(sorter)) {
        params.sort = {
          'column': sorter.columnKey,
          'order': sorter.order
        };
      }

      this.pagination = pagination;
      this.getPoliciesFromDatabase(params);
    },

    handleSearch(selectedKeys, confirm, key) {
      this.searchText = selectedKeys[0];
      this.searchedColumn = key;
      confirm();
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },

    async getPoliciesFromDatabase(params) {
      let rp = await this.getPolicies(params);

      if (rp.success) {
        this.pagination = {
          current: rp.data.current_page,
          pageSize: rp.data.per_page,
          total: rp.data.total
        };
        this.policies = rp.data.data;
      } else {
        this.$message.warning(rp.message);
      }
    }
  },

  mounted() {
    this.getPoliciesFromDatabase();
  }
};
</script>
