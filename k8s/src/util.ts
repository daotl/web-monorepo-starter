import merge from 'deepmerge'

export const mergeArrayByName: merge.Options['arrayMerge'] = (
  target,
  source,
  options,
): unknown[] => {
  const destination = target.slice()

  for (const item of source) {
    const idx = destination.findIndex(
      e => e?.name !== undefined && e?.name && e?.name === item?.name,
    )
    if (idx === -1) {
      destination.push(item)
    } else if (options?.isMergeableObject?.call(options, item)) {
      destination[idx] = merge(destination[idx], item, options)
    }
  }
  return destination
}
