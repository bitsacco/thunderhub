import React, { useState } from 'react';
import {
  Card,
  CardWithTitle,
  LeftAlign,
  Separation,
  SingleLine,
  SubTitle,
} from '../../../../components/generic/Styled';
import { Sun } from 'react-feather';
import { renderLine } from '../../../../components/generic/helpers';
import { toast } from 'react-toastify';
import { Input } from '../../../../components/input';
import { ColorButton } from '../../../../components/buttons/colorButton/ColorButton';
import { Price } from '../../../../components/price/Price';
import { useGatewayDispatch } from '../../../../context/GatewayContext';
import { gatewayApi } from '../../../../api/GatewayApi';
import { GatewayInfo } from '../../../../api/types';
import { useGatewayEcashTotalSats } from '../../../../hooks/UseGatewayEcashTotal';
import { useNodeInfo } from '../../../../hooks/UseNodeInfo';

interface FedimintGatewayCardProps {
  gatewayInfo: GatewayInfo;
}

const sectionColor = '#FFD300';

export const FedimintGatewayCard = ({
  gatewayInfo,
}: FedimintGatewayCardProps) => {
  const gatewayDispath = useGatewayDispatch();
  const [inviteCode, setInviteCode] = useState('');
  const totalFedimintEcash = useGatewayEcashTotalSats();
  const { syncedToChain } = useNodeInfo();

  const handleEnter = () => {
    if (!syncedToChain) {
      toast.error(
        'Node not synced to chain yet, cannot connect to federation.'
      );
      return;
    }

    gatewayApi.connectFederation(inviteCode).then(() => {
      gatewayApi
        .fetchInfo()
        .then(info => gatewayDispath({ type: 'connected', state: info }))
        .catch(({ error }) => {
          toast.error(error.message);
        });
    });
  };

  return (
    <CardWithTitle>
      <Card>
        <LeftAlign>
          <Sun size={18} color={sectionColor} />
          <SubTitle>Fedimint Ecash</SubTitle>
        </LeftAlign>
        <Separation />
        {!gatewayInfo.federations || gatewayInfo.federations.length === 0 ? (
          <>
            {/* TODO: Left Align the Text */}
            <div style={{ margin: '-4px 0 16px 0', textAlign: 'left' }}>
              {'Connect to a Federation'}
            </div>
            <SingleLine>
              <Input
                placeholder="Paste Invite Code"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
              />
              <ColorButton
                disabled={inviteCode === ''}
                onClick={handleEnter}
                withMargin={'0 0'}
                fullWidth={false}
              >
                Connect
              </ColorButton>
            </SingleLine>
          </>
        ) : (
          <div style={{ minHeight: '54px' }}>
            {renderLine('Total Amount', <Price amount={totalFedimintEcash} />)}
            {renderLine(
              'Connected Federations',
              gatewayInfo.federations.length
            )}
            {renderLine(
              'FeeRate (Base/PPM)',
              `${gatewayInfo.fees.base_msat}/${gatewayInfo.fees.proportional_millionths}`
            )}
          </div>
        )}
      </Card>
    </CardWithTitle>
  );
};
