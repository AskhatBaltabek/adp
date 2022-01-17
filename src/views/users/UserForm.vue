<template>
  <div>
    <a-tabs
        default-active-key="1"
        @change="callback"
        tab-position="left"
    >
      <a-tab-pane class="tab-pane" key="1" tab="Общие">
        <main-form />
      </a-tab-pane>
      <a-tab-pane class="tab-pane" key="2" tab="Доступы">
        <user-roles />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import MainForm from '../../components/users/MainForm'
import UserRoles from '../../components/users/UserRoles'
export default {
  data() {
    return {

    }
  },
  components: {MainForm, UserRoles},
  methods: {
    callback(key) {
      console.log(key);
    },
    async loadData() {
      await this.$store.dispatch('users/LOAD_USER', this.$route.params.id)
    }
  },
  mounted() {
    this.loadData()
  },
  computed: {

  }
}
</script>

<style scoped>
</style>