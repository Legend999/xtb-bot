import { StrategyParams } from '@components/stocks/StockPriceUpdates.tsx';
import useSafeAsync from '@hooks/useSafeAsync.ts';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  validateStrategyDPercent,
  validateStrategyDPricePerLevel,
} from '@shared/utils/validators.ts';

interface StrategyParametersProps {
  strategyParams: StrategyParams;
  onChange: (field: 'percent' | 'pricePerLevel', value: string) => void;
  onRun: () => Promise<void>;
  loading: boolean;
}

function StrategyParameters({
  strategyParams,
  onChange,
  onRun,
  loading,
}: StrategyParametersProps) {
  const safeAsync = useSafeAsync();
  const theme = useTheme();

  const {editable, percent, pricePerLevel} = strategyParams;
  const percentErrorMessage = percent !== '' ? validateStrategyDPercent(Number(percent)) : null;
  const pricePerLevelErrorMessage = pricePerLevel !== '' ? validateStrategyDPricePerLevel(Number(pricePerLevel)) : null;
  const isStrategyValid = percent !== '' && pricePerLevel !== '' && !percentErrorMessage && !pricePerLevelErrorMessage;

  return <Box
    sx={{
      marginY: 2,
      p: 2,
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider}`,
    }}
  >
    <Typography variant="h6" sx={{fontWeight: 500, mb: 2}}>
      Strategy Parameters
    </Typography>
    <Box
      sx={{
        display: 'flex',
        gap: 2,
      }}
    >
      <TextField
        label="Percent"
        value={percent}
        onChange={(e) => { onChange('percent', e.target.value); }}
        slotProps={{
          input: {
            endAdornment:
              <InputAdornment position="end">%</InputAdornment>,
          },
        }}
        variant="outlined"
        size="small"
        type="number"
        error={percentErrorMessage !== null}
        helperText={percentErrorMessage ?? ' '}
        disabled={!editable}
      />
      <TextField
        label="Price Per Level"
        value={pricePerLevel}
        onChange={(e) => { onChange('pricePerLevel', e.target.value); }}
        variant="outlined"
        size="small"
        type="number"
        error={pricePerLevelErrorMessage !== null}
        helperText={pricePerLevelErrorMessage ?? ' '}
        disabled={!editable}
      />
    </Box>
    <Box>
      <Button
        variant="contained"
        startIcon={loading
          ? <CircularProgress size={20} color="inherit"/>
          : <PlayArrowIcon/>}
        onClick={safeAsync(onRun)}
        sx={{
          textTransform: 'none',
          backgroundColor: theme.palette.success.main,
          '&:hover': {
            backgroundColor: theme.palette.success.dark,
          },
        }}
        disabled={loading || !editable || !isStrategyValid}
      >
        Run
      </Button>
    </Box>
  </Box>;
}

export default StrategyParameters;
