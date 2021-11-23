import React, { useEffect, useState } from 'react';
import { updateDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { calculateEstimate } from '@the-collab-lab/shopping-list-utils';
import './Item.css';
import DeleteItemButton from './DeleteItemButton';
import { calculateDaysSincePurchased, isActive } from './Helper';

function Item({ item, userToken, focusOnInput }) {
  const [checked, setChecked] = useState(false);
  const [daysSincePurchased, setDaysSincePurchased] = useState(0);

  useEffect(() => {
    if (item.lastPurchased) {
      setDaysSincePurchased(calculateDaysSincePurchased(item.lastPurchased));
    }
  }, [item]);

  useEffect(() => {
    if (daysSincePurchased < 1 && daysSincePurchased !== 0) {
      setChecked(true);
      return;
    }

    setChecked(false);
  }, [daysSincePurchased]);

  const handleCheckboxChange = () => {
    if (!checked) {
      handleCheck();
    } else {
      handleUnCheck();
    }

    setChecked(!checked);
  };

  const handleCheck = async () => {
    const docRef = doc(db, 'users', `${userToken}`, 'list', item.id);
    updateDoc(docRef, {
      backupLastPurchased: item.lastPurchased,
      backupDaysUntilNextPurchase: item.daysUntilNextPurchase,
      backupNumberOfPurchases: item.numberOfPurchases,
      lastPurchased: serverTimestamp(),
      numberOfPurchases: item.numberOfPurchases + 1,
      daysUntilNextPurchase: parseInt(
        calculateEstimate(
          item.purchaseInterval,
          daysSincePurchased,
          item.numberOfPurchases,
        ),
        10,
      ),
    });
  };

  const handleUnCheck = async () => {
    const docRef = doc(db, 'users', `${userToken}`, 'list', item.id);
    updateDoc(docRef, {
      lastPurchased: item.backupLastPurchased,
      numberOfPurchases: item.backupNumberOfPurchases,
      daysUntilNextPurchase: item.backupDaysUntilNextPurchase,
    });
  };

  let checkboxStyle = {};
  let nameAriaLabel = '';

  switch (true) {
    case !isActive(item, daysSincePurchased):
      checkboxStyle = { backgroundColor: 'lightgray' };
      nameAriaLabel = `${item.itemName} is inactive.`;
      break;
    case item.daysUntilNextPurchase >= 2 && item.daysUntilNextPurchase <= 7:
      checkboxStyle = { backgroundColor: 'lightgreen' };
      nameAriaLabel = `Buy ${item.itemName} soon`;
      break;
    case item.daysUntilNextPurchase >= 8 && item.daysUntilNextPurchase <= 30:
      checkboxStyle = { backgroundColor: 'lightblue' };
      nameAriaLabel = `Buy ${item.itemName} kind of soon.`;
      break;
    case item.daysUntilNextPurchase > 30:
      checkboxStyle = { backgroundColor: 'lightyellow' };
      nameAriaLabel = `Buy ${item.itemName} not soon.`;
      break;
    default:
      checkboxStyle = { backgroundColor: 'lightgray' };
      nameAriaLabel = `${item.itemName} inactive.`;
  }

  return (
    <li aria-label={nameAriaLabel} className="item" style={checkboxStyle}>
      <form>
        <label htmlFor={`itemPurchased-${item.id}`}>Purchased</label>
        <input
          id={`itemPurchased-${item.id}`}
          type="checkbox"
          checked={checked}
          name="itemPurchased"
          onChange={handleCheckboxChange}
        />
      </form>
      <p className="item-name">{item.itemName}</p>
      <DeleteItemButton
        item={item.id}
        userToken={userToken}
        focusOnInput={focusOnInput}
      />
    </li>
  );
}

export default Item;
