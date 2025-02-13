import React, { useEffect, useMemo, useState } from 'react';
import useStore from '@store/store';
import { shallow } from 'zustand/shallow';

import { countCurrentTokens, countTotalTokens } from '@utils/messageUtils';
import { defaultModel, modelCost } from '@constants/chat';

const TokenCount = React.memo(() => {
  const [tokenCount, setTokenCount] = useState<number[][]>([[0,0],[0,0]]);
  const generating = useStore((state) => state.generating);
  const messages = useStore(
    (state) =>
      state.chats ? state.chats[state.currentChatIndex].messages : [],
    shallow
  );

  const model = useStore((state) =>
    state.chats
      ? state.chats[state.currentChatIndex].config.model
      : defaultModel
  );

  const cost = useMemo(() => {
    const price = modelCost[model].prompt.price * (tokenCount[0][0] / modelCost[model].prompt.unit)
                + modelCost[model].completion.price * (tokenCount[0][1] / modelCost[model].completion.unit);
    const priceTotal = modelCost[model].prompt.price * (tokenCount[1][0] / modelCost[model].prompt.unit)
                + modelCost[model].completion.price * (tokenCount[1][1] / modelCost[model].completion.unit);
    return [price, priceTotal];
  }, [model, tokenCount]);

  useEffect(() => {
    /*if (!generating)*/ setTokenCount([countCurrentTokens(messages, model), countTotalTokens(messages, model)]);
  }, [messages, generating]);

  return (
    <div className='absolute top-[-16px] right-0'>
      <div className='text-xs italic text-gray-900 dark:text-gray-300'>
        Tokens: {tokenCount[1][0]}+{tokenCount[1][1]} (${cost[1].toPrecision(3)})
      </div>
    </div>
  );
});

export default TokenCount;
