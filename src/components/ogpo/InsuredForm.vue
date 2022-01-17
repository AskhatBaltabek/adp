<template>
  <div>
    <a-row style="width: 700px; margin-bottom: 24px">
      <a-col :span="16" :offset="8">
        <a-checkbox
          :checked="!!+form.resident_bool"
          @change="changeResidentBool"
        >Является резидентом</a-checkbox>
      </a-col>
    </a-row>

    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="ogpo-form"
    >
      <a-form-model-item prop="iin" label="ИИН">
        <a-input-search
          v-model="form.iin"
          placeholder="Введите ИИН"
          enter-button="Поиск"
          @search="onSearch"
          v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'"
        />
        <a-input v-model="form.iin" v-else/>
      </a-form-model-item>

      <a-form-model-item prop="last_name" label="Фамилия">
        <a-input
          v-model="form.last_name"
          placeholder="Введите фамилию"
        />
      </a-form-model-item>

      <a-form-model-item prop="first_name" label="Имя">
        <a-input
          v-model="form.first_name"
          placeholder="Введите имя"
        />
      </a-form-model-item>

      <a-form-model-item prop="middle_name" label="Отчество">
        <a-input
          v-model="form.middle_name"
          placeholder="Введите отчество"
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

      <a-form-model-item prop="driver_certificate" label="Номер вод. уд.">
        <a-input
          v-model="form.driver_certificate"
          placeholder="Введите номер водительского удостоверения"
        />
      </a-form-model-item>

      <a-form-model-item prop="driver_certificate_date" label="Дата выдачи вод. уд.">
        <a-date-picker
          :value="driverLicenseGivenDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи водительского удостоверения"
          @change="handleDriverLicenseGivenDate"
        />
      </a-form-model-item>

      <a-form-model-item prop="driver_certificate_type_id" label="Тип вод. прав">
        <a-select
          v-model="form.driver_certificate_type_id"
          placeholder="Выберите тип водительских прав"
        >
          <a-select-option :value="1">Права РК</a-select-option>
          <a-select-option :value="2">Временные права РК</a-select-option>
          <a-select-option :value="3">Иностранные права</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item prop="experience_less" label="Стаж вождения менее 2-х лет">
        <a-checkbox
          :checked="!!+form.experience_less"
          @change="changeExperienceLess"
        ></a-checkbox>
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

      <a-form-model-item label="Является льготником">
        <a-checkbox
          :checked="!!form.is_privileged"
          @change="changeIsPrivileged"
        ></a-checkbox>
      </a-form-model-item>

      <a-form-model-item label="Тип льготы" v-if="!!form.is_privileged">
        <a-select
          v-model="privilege"
          placeholder="Выберите тип"
          @change="changePrivileged"
        >
          <a-select-option
            v-for="(title, key) of privileges"
            :key="key"
            :value="key"
          >{{ title }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item
        prop="priveledger_certificate"
        label="Номер удостоверения"
        v-if="!!form.priveleger_bool"
      >
        <a-input
          v-model="form.priveledger_certificate"
          placeholder="Введите номер удостоверения"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="priveledger_certificate_date"
        label="Дата выдачи удостоверения"
        v-if="!!form.priveleger_bool"
      >
        <a-date-picker
          :value="priveledgerCertificateDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи удостоверения"
          @change="handlePriveledgerCertificateDate"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="pensioner_certificate"
        label="Номер удостоверения"
        v-if="!!form.pensioner_bool"
      >
        <a-input
          v-model="form.pensioner_certificate"
          placeholder="Введите номер удостоверения"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="pensioner_certificate_date"
        label="Дата выдачи удостоверения"
        v-if="!!form.pensioner_bool"
      >
        <a-date-picker
          :value="pensionerCertificateDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи удостоверения"
          @change="handlePensionerCertificateDate"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="wow_certificate"
        label="Номер удостоверения"
        v-if="!!form.wow_bool"
      >
        <a-input
          v-model="form.wow_certificate"
          placeholder="Введите номер удостоверения"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="wow_certificate_date"
        label="Дата выдачи удостоверения"
        v-if="!!form.wow_bool"
      >
        <a-date-picker
          :value="wowCertificateDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи удостоверения"
          @change="handleWowCertificateDate"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="invalid_certificate"
        label="Номер удостоверения"
        v-if="!!form.invalid_bool"
      >
        <a-input
          v-model="form.invalid_certificate"
          placeholder="Введите номер удостоверения"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="invalid_certificate_beg_date"
        label="Дата выдачи удостоверения"
        v-if="!!form.invalid_bool"
      >
        <a-date-picker
          :value="invalidCertificateBegDate"
          :format="dateFormat"
          placeholder="Укажите дата выдачи удостоверения"
          @change="handleInvalidCertificateBegDate"
        />
      </a-form-model-item>

      <a-form-model-item
        prop="invalid_certificate_end_date"
        label="Дата завершения удостоверения"
        v-if="!!form.invalid_bool"
      >
        <a-date-picker
          :value="invalidCertificateEndDate"
          :format="dateFormat"
          placeholder="Укажите дата завершения удостоверения"
          @change="handleInvalidCertificateEndDate"
        />
      </a-form-model-item>

      <a-form-model-item
        :wrapper-col="{ span: 16, offset: 8 }"
        class="ogpo-form__save-btn"
        v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'"
      >
        <a-button
          type="primary"
          @click="saveForm"
          :disabled="!form.id && !searchCount"
        >Сохранить</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import moment from 'moment'

export default {
  props: {
    insured: Object
  },

  data() {
    const validateIIN = (rule, value, callback) => {
      if (this.form.resident_bool && value.length !== 12) {
        callback(new Error('Длина поля ИИН должна быть 12'));
      } else {
        callback();
      }
    };

    return {
      dateFormat: 'DD.MM.YYYY',
      form: { ...this.insured },
      rules: {
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
        driver_certificate: [
          { required: true, message: 'Поле "Номер вод. уд." обязательно для заполнения', trigger: 'blur' },
        ],
        driver_certificate_date: [
          { required: true, message: 'Поле "Дата выдачи вод. уд." обязательно для заполнения', trigger: 'change' },
        ],
        driver_certificate_type_id: [
          { required: true, message: 'Поле "Тип водительских прав" обязательно для заполнения', trigger: 'blur' },
        ],
        age_experience_id: [
          { required: true, message: 'Поле "Стаж и возраст" обязательно для заполнения', trigger: 'change' }
        ],
        country_id: [
          { required: true, message: 'Поле "Страна" обязательно для заполнения', trigger: 'blur' },
        ],
        priveledger_certificate: [
          { required: true, message: 'Поле "Номер удостоверения" обязательно для заполнения', trigger: 'blur' },
        ],
        priveledger_certificate_date: [
          { required: true, message: 'Поле "Дата выдачи удостоверения" обязательно для заполнения', trigger: 'change' },
        ],
        pensioner_certificate: [
          { required: true, message: 'Поле "Номер удостоверения" обязательно для заполнения', trigger: 'blur' },
        ],
        pensioner_certificate_date: [
          { required: true, message: 'Поле "Дата выдачи удостоверения" обязательно для заполнения', trigger: 'change' },
        ],
        wow_certificate: [
          { required: true, message: 'Поле "Номер удостоверения" обязательно для заполнения', trigger: 'blur' },
        ],
        wow_certificate_date: [
          { required: true, message: 'Поле "Дата выдачи удостоверения" обязательно для заполнения', trigger: 'change' },
        ],
        invalid_certificate: [
          { required: true, message: 'Поле "Номер удостоверения" обязательно для заполнения', trigger: 'blur' },
        ],
        invalid_certificate_beg_date: [
          { required: true, message: 'Поле "Дата выдачи удостоверения" обязательно для заполнения', trigger: 'change' },
        ],
        invalid_certificate_end_date: [
          { required: true, message: 'Поле "Дата завершения удостоверения" обязательно для заполнения', trigger: 'change' },
        ]
      },
      privileges: {
        'priveleger_bool': 'Лицо приравненное к УВОВ',
        'pensioner_bool': 'Пенсионер',
        'wow_bool': 'Участник ВОВ',
        'invalid_bool': 'Инвалид I, II группы',
      },
      privilege: 'priveleger_bool',
      searchCount: 0,
    };
  },

  computed: {
    ...mapState('ogpo', {
      documentTypes: state => state.documentTypes,
      countries: state => state.countries,
      policy: state => state.policy
    }),

    dateOfBirth() {
      return this.form.born ? moment(this.form.born, this.dateFormat) : null;
    },

    insuredAge() {
      return this.form.born ? moment().diff(moment(this.form.born, this.dateFormat), 'years') : 0;
    },

    documentGivenDate() {
      return this.form.document_gived_date ? moment(this.form.document_gived_date, this.dateFormat) : null;
    },

    driverLicenseGivenDate() {
      return this.form.driver_certificate_date ? moment(this.form.driver_certificate_date, this.dateFormat) : null;
    },

    priveledgerCertificateDate() {
      return this.form.priveledger_certificate_date ? moment(this.form.priveledger_certificate_date, this.dateFormat) : null;
    },

    pensionerCertificateDate() {
      return this.form.pensioner_certificate_date ? moment(this.form.pensioner_certificate_date, this.dateFormat) : null;
    },

    wowCertificateDate() {
      return this.form.wow_certificate_date ? moment(this.form.wow_certificate_date, this.dateFormat) : null;
    },

    invalidCertificateBegDate() {
      return this.form.invalid_certificate_beg_date ? moment(this.form.invalid_certificate_beg_date, this.dateFormat) : null;
    },

    invalidCertificateEndDate() {
      return this.form.invalid_certificate_end_date ? moment(this.form.invalid_certificate_end_date, this.dateFormat) : null;
    },
  },

  watch: {
    insured(value) {
      this.form = { ...value };
    },

    insuredAge() {
      this.setAgeExperienceId(this.form.experience_less);
    }
  },

  methods: {
    ...mapActions('ogpo', [
      'searchClient',
      'verifyClient'
    ]),

    handleDateOfBirth(date, dateString) {
      this.form.born = dateString;
    },

    handleDocumentGivenDate(date, dateString) {
      this.form.document_gived_date = dateString;
    },

    handleDriverLicenseGivenDate(date, dateString) {
      this.form.driver_certificate_date = dateString;
    },

    handlePriveledgerCertificateDate(date, dateString) {
      this.form.priveledger_certificate_date = dateString;
    },

    handlePensionerCertificateDate(date, dateString) {
      this.form.pensioner_certificate_date = dateString;
    },

    handleWowCertificateDate(date, dateString) {
      this.form.wow_certificate_date = dateString;
    },

    handleInvalidCertificateBegDate(date, dateString) {
      this.form.invalid_certificate_beg_date = dateString;
    },

    handleInvalidCertificateEndDate(date, dateString) {
      this.form.invalid_certificate_end_date = dateString;
    },

    changeIsPrivileged(e) {
      if (e.target.checked) {
        this.form.is_privileged = 1;
        this.changePrivileged('priveleger_bool');
      } else {
        this.form.is_privileged = 0;
        this.changePrivileged();
      }
    },

    changePrivileged(value = '') {
      for (const prop in this.privileges) {
        if (prop === value) {
          this.form[prop] = 1;
        } else {
          this.form[prop] = 0;
        }
      }

      this.form.priveledger_certificate = '';
      this.form.priveledger_certificate_date = '';
      this.form.pensioner_certificate = '';
      this.form.pensioner_certificate_date = '';
      this.form.wow_certificate = '';
      this.form.wow_certificate_date = '';
      this.form.invalid_certificate = '';
      this.form.invalid_certificate_beg_date = '';
      this.form.invalid_certificate_end_date = '';
    },

    changeResidentBool(e) {
      this.form.resident_bool = e.target.checked ? 1 : 0;
      this.form.country_id = e.target.checked ? 1 : undefined;
      this.form.iin = '';
    },

    countryFilterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },

    setAgeExperienceId(experienceLess) {
      if (experienceLess) {
        if (this.insuredAge < 25) {
          this.form.age_experience_id = 1;
        } else {
          this.form.age_experience_id = 3;
        }
      } else {
        if (this.insuredAge < 25) {
          this.form.age_experience_id = 2;
        } else {
          this.form.age_experience_id = 4;
        }
      }
    },

    changeExperienceLess(e) {
      this.form.experience_less = e.target.checked ? 1 : 0;
      this.setAgeExperienceId(e.target.checked);
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
        } else {
          this[rp.dialog]({ title: rp.message });
        }
      }
    },

    saveForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let rp = await this.verifyClient(this.form);

          this.showMessage(rp);
        } else {
          console.log('error submit!!');
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

  mounted() {
    // Если признак льготника указан то выбрать тип льгота
    if (this.form.is_privileged) {
      for (const prop in this.privileges) {
        if (this.form[prop]) {
          this.privilege = prop;
        }
      }
    }

    if (+this.form.resident_bool && !this.form.country_id) {
      this.form.country_id = 1;
    }

    if (+this.form.natural_person_bool && this.form.born) {
      this.setAgeExperienceId(false);
    }
  }
}
</script>
