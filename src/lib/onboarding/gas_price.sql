select
	date_trunc('hour', timestamp) as "datetime",
	quantile (0.5) (reinterpretAsUInt256 (effective_gas_price) / 1e9) as "average",
	quantile (0.9) (reinterpretAsUInt256 (effective_gas_price) / 1e9) as "fast"
from
	agnostic__blockchain__ethereum_mainnet__transactions
where
	date = yesterday ()
group by
	"datetime"
order by
	"datetime"
