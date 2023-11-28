import merge from 'deepmerge'

/* eslint-disable ts/no-explicit-any,ts/no-unsafe-member-access,ts/no-unsafe-argument,ts/no-unsafe-assignment,ts/no-unsafe-return */
export const mergeArrayByName: merge.Options['arrayMerge'] = (
  target,
  source,
  options,
): any[] => {
  const destination = target.slice()

  source.forEach((item, _index) => {
    const idx = destination.findIndex(
      e => e?.name !== undefined && e?.name && e?.name === item?.name,
    )
    if (idx === -1) {
      destination.push(item)
    }
    else if (options?.isMergeableObject!(item)) {
      destination[idx] = merge(destination[idx], item, options)
    }
  })
  return destination
}
