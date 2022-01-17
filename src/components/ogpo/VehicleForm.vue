<template>
  <div>
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="ogpo-form"
    >
      <a-form-model-item prop="reg_num" label="Гос. номер">
        <a-input-search
          placeholder="Введите гос. номер"
          :value="form.reg_num"
          @input="form.reg_num = $event.target.value.toUpperCase()"
          enter-button="Искать"
          @search="searchVehicleByNumber"
          v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'"
        />
        <a-input v-model="form.reg_num" v-else/>
      </a-form-model-item>

      <a-form-model-item prop="vin" label="VIN/Номер кузова">
        <a-input-search
          placeholder="Введите номер кузова"
          :value="form.vin"
          @input="form.vin = $event.target.value.toUpperCase()"
          @search="searchVehicleByVIN"
          v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'"
        >
          <a-button slot="enterButton">Искать</a-button>
        </a-input-search>
        <a-input v-model="form.vin" v-else/>
      </a-form-model-item>

      <a-form-model-item prop="region_id" label="Регион регистрации">
        <a-select
          ref="regionId"
          v-model="form.region_id"
          placeholder="Выберите регион"
          @change="changeRegionId"
          :disabled="!!form.region_id && !!form.verified_bool"
        >
          <a-select-option
            v-for="region of regions"
            :key="region.esbd_id"
            :value="region.esbd_id"
          >{{ region.title }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="type_id" label="Тип ТС">
        <a-select
          v-model="form.type_id"
          placeholder="Выберите тип"
          :disabled="!!form.type_id && !!form.verified_bool"
        >
          <a-select-option
            v-for="type of vehicleTypes"
            :key="type.esbd_id"
            :value="type.esbd_id"
          >{{ type.title }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="year" label="Год выпуска">
        <a-select
          v-model="form.year"
          placeholder="Выберите год"
          :disabled="!!form.year && !!form.verified_bool"
        >
          <a-select-option
            v-for="year of years"
            :key="year"
            :value="year"
          >{{ year }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="engine_volume" label="Объем двигателя (куб.см)">
        <a-input-number
          v-model="form.engine_volume"
          placeholder="Введите объем двигателя"
          :disabled="!!form.engine_volume && !!form.verified_bool"
        />
      </a-form-model-item>

      <a-form-model-item prop="mark" label="Марка">
        <a-input
          v-model="form.mark"
          placeholder="Введите марку"
          :disabled="!!form.mark && !!form.verified_bool"
        />
      </a-form-model-item>

      <a-form-model-item prop="model" label="Модель">
        <a-input
          v-model="form.model"
          placeholder="Введите модель"
          :disabled="!!form.model && !!form.verified_bool"
        />
      </a-form-model-item>

      <a-form-model-item prop="reg_cert_num" label="Номер свид. рег. ТС">
        <a-input
          v-model="form.reg_cert_num"
          placeholder="Введите номер свидетельства о регистрации ТС"
          :disabled="!!form.reg_cert_num && !!form.verified_bool"
        />
      </a-form-model-item>

      <a-form-model-item prop="dt_reg_cert" label="Дата выдачи">
        <a-date-picker
          :value="documentGivenDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи свидетельсва"
          @change="handleDocumentGivenDate"
          :disabled="!!form.dt_reg_cert && !!form.verified_bool"
        />
      </a-form-model-item>

      <a-form-model-item prop="country_id" label="Страна" v-if="form.region_id === 17">
        <a-select
          v-model="form.country_id"
          placeholder="Выберите страну гражданства"
        >
          <a-select-option
            v-for="country of countries"
            :key="country.country_id"
            :value="country.country_id"
          >{{ country.title }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item
        :wrapper-col="{ span: 16, offset: 8 }"
        class="ogpo-form__save-btn"
        v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'"
      >
        <a-button type="primary" @click="saveForm">Сохранить</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import moment from 'moment'

export default {
  props: {
    vehicle: Object
  },

  data() {
    return {
      dateFormat: 'DD.MM.YYYY',
      form: { ...this.vehicle },
      rules: {
        reg_num: [
          { required: true, message: 'Поле "Гос. номер" обязательно для заполнения', trigger: 'change' },
        ],
        vin: [
          { required: true, message: 'Поле "VIN/Номер кузова" обязательно для заполнения', trigger: 'change' },
        ],
        region_id: [
          { required: true, message: 'Поле "Регион региcтрации" обязательно для заполнения', trigger: 'blur' },
        ],
        type_id: [
          { required: true, message: 'Поле "Тип ТС" обязательно для заполнения', trigger: 'blur' },
        ],
        year: [
          { required: true, message: 'Поле "Год выпуска" обязательно для заполнения', trigger: 'blur' },
        ],
        engine_volume: [
          { required: true, message: 'Поле "Объем двигателя" обязательно для заполнения', trigger: 'blur' },
        ],
        mark: [
          { required: true, message: 'Поле "Марка" обязательно для заполнения', trigger: 'blur' },
        ],
        model: [
          { required: true, message: 'Поле "Модель" обязательно для заполнения', trigger: 'blur' },
        ],
        reg_cert_num: [
          { required: true, message: 'Поле "Номер свид. рег. ТС" обязательно для заполнения', trigger: 'blur' },
        ],
        dt_reg_cert: [
          { required: true, message: 'Поле "Дата выдачи" обязательно для заполнения', trigger: 'change' },
        ],
        country_id: [
          { required: true, message: 'Поле "Страна" обязательно для заполнения', trigger: 'change' },
        ]
      }
    };
  },

  computed: {
    ...mapState('ogpo', {
      regions: state => state.regions,
      years: state => state.years,
      countries: state => state.countries,
      vehicleTypes: state => state.vehicleTypes,
      policy: state => state.policy
    }),

    documentGivenDate() {
      return this.form.dt_reg_cert ? moment(this.form.dt_reg_cert, this.dateFormat) : null;
    },
  },

  watch: {
    vehicle(value) {
      this.form = { ...value };
    }
  },

  methods: {
    ...mapActions('ogpo', [
      'searchVehicle',
      'verifyVehicle',
      'changeVehiclePane',
    ]),

    handleDocumentGivenDate(date, dateString) {
      this.form.dt_reg_cert = dateString;
    },

    changeRegionId(value) {
      this.form.country_id = value === 17 ? undefined : 1;

      if (value === 15 || value === 16 || value === 17 || value === 18 || value === 19) {
        this.form.big_city_bool = 1;
      } else {
        this.form.big_city_bool = 0;
      }
    },

    async searchVehicleByNumber(value) {
      let valid = true;

      this.$refs.form.validateField(['reg_num'], (message) => {
        if (message !== '') {
          valid = false;
        }
      });

      if (valid) {
        let result = await this.searchVehicle({ reg_num: value });

        this.showMessage(result);
      }
    },

    async searchVehicleByVIN(value) {
      let valid = true;

      this.$refs.form.validateField(['vin'], (message) => {
        if (message !== '') {
          valid = false;
        }
      });

      if (valid) {
        let result = await this.searchVehicle({ vin: value });

        this.showMessage(result);
      }
    },

    saveForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (!this.form.verified_bool) {
            let result = await this.verifyVehicle({ ...this.form });

            this.showMessage(result);
          } else {
            this.changeVehiclePane({
              vehicle: {},
              verified: true
            });
            this.$message.success('ТС успешно сохранено.');
          }
        }
      });
    },

    showMessage(obj) {
      if (obj.success) {
        this.$message.success(obj.message);
      } else {
        this[obj.dialog]({ title: obj.message });
      }
    }
  },
}
</script>
