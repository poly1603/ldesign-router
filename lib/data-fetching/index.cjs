/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var DataFetchingManager = require('./DataFetchingManager.cjs');
var useDataFetching = require('./useDataFetching.cjs');



exports.DATA_FETCHING_KEY = DataFetchingManager.DATA_FETCHING_KEY;
exports.DataFetchingManager = DataFetchingManager.DataFetchingManager;
exports.DataFetchingPlugin = DataFetchingManager.DataFetchingPlugin;
exports.createDataFetchingManager = DataFetchingManager.createDataFetchingManager;
exports.useDataFetching = useDataFetching.useDataFetching;
exports.useInfiniteDataFetching = useDataFetching.useInfiniteDataFetching;
exports.useLazyDataFetching = useDataFetching.useLazyDataFetching;
exports.useMultipleDataFetching = useDataFetching.useMultipleDataFetching;
exports.usePaginatedDataFetching = useDataFetching.usePaginatedDataFetching;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
