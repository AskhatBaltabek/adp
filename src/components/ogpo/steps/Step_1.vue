<template>
  <div>
    <a-row style="width: 700px; margin-bottom: 24px">
      <a-col :span="8" :offset="8">
        <a-checkbox
          :checked="+form.natural_person_bool === 0"
          @change="changeNaturalPersonBool"
          :disabled="$route.name !== 'ogpo.create'"
        >Является юр. лицом</a-checkbox>
      </a-col>

      <a-col :span="8">
        <a-checkbox
          :checked="+form.resident_bool === 1"
          @change="changeResidentBool"
        >Является резидентом</a-checkbox>
      </a-col>
    </a-row>

    <a-form-model
      ref="form"
      :model="form"
      :rules="naturalPersonRules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="ogpo-form"
      v-if="!!form.natural_person_bool"
    >
      <a-form-model-item prop="iin" label="ИИН">
        <a-input-search
          v-model.trim="form.iin"
          placeholder="Введите ИИН клиента"
          enter-button="Поиск"
          @search="onSearch"
          v-if="$route.name === 'ogpo.create'"
        />
        <a-input v-model="form.iin" v-else/>
      </a-form-model-item>

      <a-form-model-item prop="last_name" label="Фамилия">
        <a-input
          v-model.trim="form.last_name"
          placeholder="Введите фамилию клиента"
        />
      </a-form-model-item>

      <a-form-model-item prop="first_name" label="Имя">
        <a-input
          v-model.trim="form.first_name"
          placeholder="Введите имя клиента"
        />
      </a-form-model-item>

      <a-form-model-item prop="middle_name" label="Отчество">
        <a-input
          v-model="form.middle_name"
          placeholder="Введите отчество клиента"
        />
      </a-form-model-item>

      <a-form-model-item prop="born" label="Дата рождения">
        <a-date-picker
          :value="dateOfBirth"
          :format="dateFormat"
          placeholder="Укажите дата рождения"
          @change="handleDateOfBirth"
        />
      </a-form-model-item>

      <a-form-model-item prop="sex_id" label="Пол">
        <a-select
          v-model="form.sex_id"
          placeholder="Выберите пол"
        >
          <a-select-option :value="1">Мужской</a-select-option>
          <a-select-option :value="2">Женский</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="document_type_id" label="Тип документа">
        <a-select
          v-model="form.document_type_id"
          placeholder="Выберите тип"
        >
          <a-select-option
            v-for="type of documentTypes"
            :key="type.esbd_id"
            :value="type.esbd_id"
          >{{ type.title }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="document_number" label="Номер документа">
        <a-input
          v-model="form.document_number"
          placeholder="Введите номер документа"
        />
      </a-form-model-item>

      <a-form-model-item prop="document_gived_date" label="Дата выдачи">
        <a-date-picker
          :value="documentGivenDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи документа"
          @change="handleDocumentGivenDate"
        />
      </a-form-model-item>

      <a-form-model-item prop="country_id" label="Страна">
        <a-select
          show-search
          option-filter-prop="children"
          :filter-option="countryFilterOption"
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

      <a-form-model-item prop="address" label="Адрес клиента">
        <a-input
          v-model="form.address"
          placeholder="Введите адрес"
        />
      </a-form-model-item>

      <div v-if="true">
        <a-form-model-item prop="notification_type_id" label="Тип уведомления">
          <a-select
            v-model="form.notification_type_id"
            placeholder="Выберите тип уведомления"
          >
            <a-select-option
              v-for="(type, key) in notificationTypes"
              :key="key"
              :value="key"
            >{{ type }}</a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item prop="mobile_phone" label="Мобильный телефон">
          <a-input
            v-model="form.mobile_phone"
            placeholder="Введите номер телефона"
            v-mask="'+7 (7##) ### ## ##'"
          />
        </a-form-model-item>

        <a-form-model-item prop="email" label="E-Mail">
          <a-input
            v-model="form.email"
            placeholder="Введите e-mail"
          />
        </a-form-model-item>
      </div>

      <a-form-model-item label="Является застрахованным">
        <a-checkbox
          :checked="!!+form.is_insured"
          @change="changeIsInsured"
        ></a-checkbox>
      </a-form-model-item>
    </a-form-model>

    <a-form-model
      ref="form"
      :model="form"
      :rules="juridicalPersonRules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="ogpo-form"
      v-else
    >
      <a-form-model-item prop="iin" label="БИН">
        <a-input-search
          v-model="form.iin"
          placeholder="Введите БИН клиента"
          enter-button="Поиск"
          @search="onSearch"
          v-if="$route.name === 'ogpo.create'"
        />
        <a-input v-model="form.iin" v-else/>
      </a-form-model-item>

      <a-form-model-item prop="juridical_person_name" label="Наименование">
        <a-input
          v-model="form.juridical_person_name"
          placeholder="Введите наименование"
        />
      </a-form-model-item>

      <a-form-model-item prop="activity_kind_id" label="Вид деятельности">
        <a-auto-complete
          placeholder="Введите название деятельности для поиска"
          v-model="form.activity_kind_id"
          @search="searchActivityKind"
        >
          <template slot="dataSource">
            <a-select-option
              v-for="item in activityKinds"
              :key="item.id_esbd"
              :value="`${item.id_esbd}`"
            >{{ item.title }}</a-select-option>
          </template>
        </a-auto-complete>
      </a-form-model-item>

      <a-form-model-item prop="economics_sector_id" label="Сектор экономики">
        <a-select
          v-model="form.economics_sector_id"
          placeholder="Выберите сектор"
        >
          <a-select-option
            v-for="sector of economicsSectors"
            :key="sector.id_esbd"
            :value="sector.id_esbd"
          >{{ sector.title }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="country_id" label="Страна">
        <a-select
          show-search
          option-filter-prop="children"
          :filter-option="countryFilterOption"
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

      <a-form-model-item prop="address" label="Фактический адрес">
        <a-input
          v-model="form.address"
          placeholder="Введите фактический адрес"
        />
      </a-form-model-item>

      <a-form-model-item prop="phones" label="Телефон">
        <a-input
          v-model="form.phones"
          placeholder="Введите номер телефона"
        />
      </a-form-model-item>

      <a-form-model-item prop="mobile_phone" label="Мобильный телефон">
        <a-input
          v-model="form.mobile_phone"
          placeholder="Введите номер мобильного телефона"
          v-mask="'+7 (7##) ### ## ##'"
        />
      </a-form-model-item>

      <a-form-model-item prop="email" label="E-Mail">
        <a-input
          v-model="form.email"
          placeholder="Введите E-Mail"
        />
      </a-form-model-item>
    </a-form-model>

    <div v-if="$route.name === 'ogpo.create'">
      <a-divider/>

      <a-button
        type="primary"
        @click="saveForm"
        :disabled="!form.id && !searchCount"
      >Далее</a-button>
    </div>

    <EsbdPolicies :policies="esbdPolicies" v-if="!!esbdPolicies.length" />
    <InsuranceEvents :insurance-events="insuranceEvents" v-if="!!insuranceEvents.length" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import moment from 'moment'
import { mask } from 'vue-the-mask'
import EsbdPolicies from '@/components/ogpo/EsbdPolicies'
import InsuranceEvents from '@/components/ogpo/InsuranceEvents'

export default {
  directives: { mask },

  components: {
    EsbdPolicies,
    InsuranceEvents
  },

  props: {
    stepData: Object
  },

  data() {
    const validateIIN = (rule, value, callback) => {
      if (this.form.resident_bool && value.length !== 12) {
        callback(new Error('Длина поля "ИИН" должна быть 12'));
      } else {
        callback();
      }
    };

    const validatePhone = (rule, value, callback) => {
      if (!value.length && (this.form.notification_type_id === 1 || this.form.notification_type_id === 3)) {
        callback(new Error('Поле "Мобильный телефон" обязательно для заполнения'));
      } else {
        callback();
      }
    };

    const validateEmail = (rule, value, callback) => {
      if (!value && (this.form.notification_type_id === 2 || this.form.notification_type_id === 3)) {
        callback(new Error('Поле "E-Mail" обязательно для заполнения'));
      } else {
        callback();
      }
    };

    return {
      dateFormat: 'DD.MM.YYYY',
      form: { ...this.stepData },
      naturalPersonRules: {
        iin: [
          { validator: validateIIN, trigger: 'blur' },
        ],
        last_name: [
          { required: true, message: 'Поле "Фамилия" обязательно для заполнения', trigger: 'blur' },
        ],
        first_name: [
          { required: true, message: 'Поле "Имя" обязательно для заполнения', trigger: 'blur' },
        ],
        born: [
          { required: true, message: 'Поле "Дата рождения" обязательно для заполнения', trigger: 'change' },
        ],
        sex_id: [
          { required: true, message: 'Поле "Пол" обязательно для заполнения', trigger: 'blur' },
        ],
        document_type_id: [
          { required: true, message: 'Поле "Тип документа" обязательно для заполнения', trigger: 'blur' },
        ],
        document_number: [
          { required: true, message: 'Поле "Номер документа" обязательно для заполнения', trigger: 'blur' },
        ],
        document_gived_date: [
          { required: true, message: 'Поле "Дата выдачи" обязательно для заполнения', trigger: 'change' },
        ],
        country_id: [
          { required: true, message: 'Поле "Страна" обязательно для заполнения', trigger: 'blur' },
        ],
        mobile_phone: [
          { validator: validatePhone, trigger: 'blur' },
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' },
        ],
      },
      juridicalPersonRules: {
        iin: [
          { required: true, message: 'Поле "БИН" обязательно для заполнения', trigger: 'blur' },
        ],
        juridical_person_name: [
          { required: true, message: 'Поле "Наименование" обязательно для заполнения', trigger: 'blur' },
        ],
        activity_kind_id: [
          { required: true, message: 'Поле "Вид деятельности" обязательно для заполнения', trigger: 'blur' },
        ],
        economics_sector_id: [
          { required: true, message: 'Поле "Сектор экономики" обязательно для заполнения', trigger: 'blur' },
        ],
        country_id: [
          { required: true, message: 'Поле "Страна" обязательно для заполнения', trigger: 'blur' },
        ],
        email: [
          { required: true, message: 'Поле "E-Mail" обязательно для заполнения', trigger: 'blur' },
        ],
      },
      esbdPolicies: [],
      insuranceEvents: [],
      timer: null,
      searchCount: 0,
    };
  },

  computed: {
    ...mapState('ogpo', {
      documentTypes: state => state.documentTypes,
      countries: state => state.countries,
      policy: state => state.policy,
      activityKinds: state => state.activityKinds,
      economicsSectors: state => state.economicsSectors,
      notificationTypes: state => state.notificationTypes,
    }),

    dateOfBirth() {
      return this.form.born ? moment(this.form.born, this.dateFormat) : null;
    },

    documentGivenDate() {
      return this.form.document_gived_date ? moment(this.form.document_gived_date, this.dateFormat) : null;
    }
  },

  watch: {
    stepData(value) {
      this.form = { ...value };
    }
  },

  methods: {
    ...mapMutations('ogpo', [
      'SET_ACTIVITY_KINDS',
      'RESET_HOLDER',
    ]),

    ...mapActions('ogpo', [
      'getDocumentTypes',
      'getCountries',
      'getVehicleTypes',
      'getRegions',
      'getActivityKinds',
      'getEconomicsSectors',
      'goToPrevStep',
      'goToNextStep',
      'searchClient',
      'verifyClient',
      'getPoliciesByClient',
      'getInsuranceEvents',
      'copyHolderToInsured',
    ]),

    changeNaturalPersonBool(e) {
      this.RESET_HOLDER({
        natural_person_bool: e.target.checked ? 0 : 1,
      });
    },

    changeResidentBool(e) {
      this.form.resident_bool = e.target.checked ? 1 : 0;
      this.form.country_id = e.target.checked ? 1 : undefined;
    },

    handleDateOfBirth(date, dateString) {
      this.form.born = dateString;
    },

    handleDocumentGivenDate(date, dateString) {
      this.form.document_gived_date = dateString;
    },

    changeIsInsured(e) {
      this.form.is_insured = e.target.checked ? 1 : 0;
    },

    searchActivityKind(searchText) {
      clearTimeout(this.timer);

      this.timer = setTimeout(() => this.getActivityKinds(searchText), 1000);
    },

    countryFilterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },

    async onSearch(iin) {
      let valid = true;
      let fieldsForResident = ['iin'];
      let fieldsForNonResident = ['last_name', 'first_name', 'born'];
      let fields;
      let payload;

      if (this.form.resident_bool) {
        this.$refs.form.clearValidate(fieldsForNonResident);

        fields = fieldsForResident;
        payload = {
          iin: iin,
          natural_person_bool: this.form.natural_person_bool,
          resident_bool: this.form.resident_bool
        };
      } else {
        this.$refs.form.clearValidate(fieldsForResident);

        fields = fieldsForNonResident;
        payload = {
          iin: iin,
          natural_person_bool: this.form.natural_person_bool,
          resident_bool: this.form.resident_bool,
          last_name: this.form.last_name,
          first_name: this.form.first_name,
          born: this.form.born
        };
      }

      this.$refs.form.validateField(fields, (message) => {
        if (message !== '') {
          valid = false;
        }
      });

      if (valid) {
        this.searchCount += 1;
        let rp = await this.searchClient(payload);

        if (rp.success) {
          this.$message.success(rp.message);

          // if (!this.policy.id) {
          //   // Получить ранее выписанные список полисов из ЕСБД
          //   this.esbdPolicies = await this.getPoliciesByClient({
          //     'client_id': this.form.id,
          //     'date_begin': moment().subtract('3', 'years').format('DD.MM.YYYY'),
          //     'date_end': moment().format('DD.MM.YYYY')
          //   });
          //
          //   // Получить список страховых случаев
          //   this.insuranceEvents = await this.getInsuranceEvents({
          //     'client_id': this.form.id,
          //     'date_begin': moment().subtract('3', 'years').format('DD.MM.YYYY'),
          //     'ie_role': 'CLIENT'
          //   });
          // }
        } else {
          this[rp.dialog]({ title: rp.message });
        }
      }
    },

    saveForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let rp = await this.verifyClient(this.form);

          if (rp.success) {
            this.$message.success(rp.message);

            this.copyHolderToInsured(+this.form.is_insured);
            this.goToNextStep();
          } else {
            this[rp.dialog]({ title: rp.message });
          }
        } else {
          console.log('error submit!!');
        }
      });
    }
  },

  created() {
    this.getDocumentTypes();
    this.getCountries();
    this.getVehicleTypes();
    this.getRegions();
    this.getEconomicsSectors();
  },

  mounted() {
    if (+this.form.resident_bool && !this.form.country_id) {
      this.form.country_id = 1;
    }
  }
}
</script>
