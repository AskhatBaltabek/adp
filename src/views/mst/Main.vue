<template>
  <div>
    <a-row type="flex">
      <a-col :span="12">
        <a-button link type="primary" icon="plus-circle"><router-link to="/mst/new" style="color:#fff;margin-left:10px">Новый полис</router-link></a-button>
      </a-col>
    </a-row>
    <a-divider />
    <mst-table />
  </div>
</template>

<script>
import MstTable from '@/components/mst/MstTable'

export default {
  components: {MstTable}
}
</script>
